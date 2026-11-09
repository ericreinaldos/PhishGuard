import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sections = (process.argv[2] ?? 'counter,b2,b3').split(',');
const profile = join(here, 'profile-b5t');
const PORT = 9343;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'ERR ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200); return r.result.value; };
const size = (w, h, m) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: m });
const go = async (p, wait = 1500) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(wait); };
const check = (name, ok, detail) => { console.log(`${ok ? 'OK   ' : 'FALLA'} ${name}${detail !== undefined ? ' -> ' + JSON.stringify(detail) : ''}`); if (!ok) process.exitCode = 2; };
await send('Page.enable'); await send('Runtime.enable');
const VIEW = [['1440x900', 1440, 900, false], ['1366x768', 1366, 768, false], ['1536x730', 1536, 730, false], ['375x812', 375, 812, true]];

if (sections.includes('counter')) {
  const m = `(()=>{const t=document.querySelector('textarea').getBoundingClientRect(); const c=[...document.querySelectorAll('span')].find(s=>s.textContent.includes('caracteres')&&s.textContent.includes('/')); const r=c.getBoundingClientRect(); const p=document.querySelector('form p[id$=hint], form p[id$=error]')?.getBoundingClientRect(); const overlap=p&&!(r.left>=p.right||r.right<=p.left||r.top>=p.bottom||r.bottom<=p.top); const form=document.querySelector('form').getBoundingClientRect(); return {counterTop:Math.round(r.top), textareaBottom:Math.round(t.bottom), fuera:r.top>=t.bottom, solapaAyuda:!!overlap, dentroForm:r.right<=form.right+1, texto:c.textContent.trim(), abs:getComputedStyle(c).position};})()`;
  for (const [n, w, h, mob] of VIEW) {
    await size(w, h, mob);
    for (const p of ['/analyzer', '/analyzer?mode=headers']) {
      await go(p);
      await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,200))`);
      const r = await ev(m);
      check(`contador ${p} a ${n}`, r.fuera && !r.solapaAyuda && r.dentroForm, r);
    }
  }
  // Con error también convive
  await size(375, 812, true);
  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Analizar').click(); new Promise(r=>setTimeout(r,250))`);
  const er = await ev(m);
  check('contador con error visible', er.fuera && !er.solapaAyuda, er);
  check('el recuento sigue actualizándose', (await ev(`(()=>{const i=document.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(i,'hola'); i.dispatchEvent(new Event('input',{bubbles:true})); return new Promise(r=>setTimeout(()=>r([...document.querySelectorAll('span')].find(s=>s.textContent.includes('/ 10')).textContent.trim()),150));})()`)).startsWith('4 /'));
  // Registro y otros campos sin contador no cambian
  await go('/login');
  check('los campos sin contador siguen igual', (await ev(`document.querySelector('#email').closest('.space-y-2').children.length`)) === 2);
}

if (sections.includes('b2')) {
  for (const [n, w, h, mob] of VIEW) {
    await size(w, h, mob);
    await go('/dashboard');
    const r = await ev(`(()=>{const quick=[...document.querySelectorAll('main h2')].find(e=>e.textContent.includes('sospechoso')).getBoundingClientRect().top; const stat=[...document.querySelectorAll('p.label')].find(e=>/realizados/i.test(e.textContent)).getBoundingClientRect().top; const list=document.querySelector('main section ul'); const mono=[...list.querySelectorAll('a')].map(a=>a.textContent.trim().slice(0,10)); const act=[...document.querySelectorAll('main h2')].find(e=>e.textContent.includes('Actividad')); const items=act.closest('section').querySelectorAll('ol li').length; const links=[...list.querySelectorAll('a')].map(a=>a.getAttribute('href')); return {quick:Math.round(quick),stat:Math.round(stat),mono,items,links,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};})()`);
    check(`Panel a ${n}: acción antes que cifras, sin 01-03, 3 actividades`, r.quick < r.stat && !r.mono.some((t) => /^0\d/.test(t)) && r.items === 3 && !r.overflow, r);
  }
  // Las columnas quedan equilibradas en escritorio
  await size(1440, 900, false);
  await go('/dashboard');
  const bal = await ev(`(()=>{const cols=[...document.querySelectorAll('main .xl\\\\:col-span-8, main .xl\\\\:col-span-4')].map(e=>Math.round(e.getBoundingClientRect().height)); return cols;})()`);
  console.log('INFO altura de columnas 8/4 a 1440:', bal);
  // Los accesos siguen funcionando
  await ev(`[...document.querySelectorAll('main section ul a')].find(a=>a.textContent.includes('URL')).click(); new Promise(r=>setTimeout(r,500))`);
  check('acceso rápido abre la modalidad', (await ev('location.pathname+location.search')) === '/analyzer?mode=url', await ev('location.search'));
}

if (sections.includes('b3')) {
  for (const [n, w, h, mob] of VIEW) {
    await size(w, h, mob);
    await go('/results?demo=1', 2200);
    const r = await ev(`(()=>{const hs=[...document.querySelectorAll('main section h2')].map(e=>e.textContent.trim()); const by=(t)=>[...document.querySelectorAll('main header button, main header a')].find(b=>b.textContent.trim()===t); const ex=by('Exportar'), sh=by('Compartir'), vu=by('Volver al analizador'); const st=(e)=>{const s=getComputedStyle(e); const b=e.getBoundingClientRect(); return {bg:s.backgroundColor, color:s.color, size:s.fontSize, weight:s.fontWeight, h:Math.round(b.height), borde:s.borderTopWidth};}; const alto=[...document.querySelectorAll('p')].find(e=>/^\\s*alto\\s*$/i.test(e.textContent)); const a=getComputedStyle(alto); const ab=alto.getBoundingClientRect(); return {orden:hs, exportar:st(ex), compartir:st(sh), volver:st(vu), alto:{size:a.fontSize, color:a.color, h:Math.round(ab.height)}, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, enCabecera:!!ex.closest('header')&&!!sh.closest('header')};})()`);
    const secundarias = [r.exportar, r.compartir].every((b) => b.bg === 'rgba(0, 0, 0, 0)' && b.borde === '0px' && parseFloat(b.size) <= 12 && b.color === 'rgb(168, 168, 164)');
    check(`Resultados a ${n}: exportar y compartir sin relleno ni borde, 12 px y gris`, secundarias && r.enCabecera, { exportar: r.exportar, compartir: r.compartir, volver: r.volver });
    const ratio = parseFloat(r.alto.size) / parseFloat(r.exportar.size);
    check(`Resultados a ${n}: «ALTO» domina (${ratio.toFixed(1)} veces mayor)`, ratio >= 5 && r.alto.color !== r.exportar.color, r.alto);
    check(`Resultados a ${n}: orden`, r.orden[0] === 'Qué hacer ahora' && r.orden[1].startsWith('Contribución') && r.orden[r.orden.length - 1].startsWith('Información') && !r.overflow, r.orden);
  }
  await size(1366, 768, false);
  await go('/results?demo=1');
  await ev(`[...document.querySelectorAll('main header button')].find(b=>b.textContent.trim()==='Exportar').click(); new Promise(r=>setTimeout(r,300))`);
  check('Exportar sigue avisando', (await ev(`document.body.textContent.includes('exportación del informe')`)));
  await go('/results');
  check('sin informe no aparecen exportar ni compartir', !(await ev(`[...document.querySelectorAll('main header button')].some(b=>/Exportar|Compartir/.test(b.textContent))`)));
  check('sin informe sigue Volver', await ev(`[...document.querySelectorAll('main header a')].some(a=>a.textContent.includes('Volver'))`));
  await go('/results?demo=1');
  const inInfo = await ev(`[...document.querySelectorAll('main section')].find(s=>s.textContent.includes('Información del análisis')).querySelectorAll('button').length`);
  check('el bloque de información ya no duplica acciones', inInfo === 0, inInfo);
}

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);
