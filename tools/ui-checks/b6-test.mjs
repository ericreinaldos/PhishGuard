import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sections = (process.argv[2] ?? 'panel,prefs,dialog,c5').split(',');
const profile = join(here, 'profile-b6t');
const PORT = 9344;
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
const go = async (p, wait = 1400) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(wait); };
const key = async (k, code, vk, mods = 0) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); };
const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
const check = (name, ok, detail) => { console.log(`${ok ? 'OK   ' : 'FALLA'} ${name}${detail !== undefined ? ' -> ' + JSON.stringify(detail) : ''}`); if (!ok) process.exitCode = 2; };
const btn = (t) => `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(t)})`;
const toggle = (id) => `document.querySelector('#${id}').click(); new Promise(r=>setTimeout(r,150))`;
await send('Page.enable'); await send('Runtime.enable');
const VIEW = [['1440x900', 1440, 900, false], ['1366x768', 1366, 768, false], ['1536x730', 1536, 730, false], ['375x812', 375, 812, true]];

if (sections.includes('panel')) {
  for (const [n, w, h, m] of [['1280x720', 1280, 720, false], ...VIEW, ['768x1024', 768, 1024, true]]) {
    await size(w, h, m);
    await go('/dashboard');
    const r = await ev(`(()=>{const hs=[...document.querySelectorAll('main section')]; const by=(t)=>hs.find(s=>s.querySelector('h2')?.textContent.includes(t)); const left=by('Últimos').querySelector('table').getBoundingClientRect().bottom; const right=by('Actividad').querySelector('ol').getBoundingClientRect().bottom; const rows=[...by('Últimos').querySelectorAll('tbody tr')].filter(t=>getComputedStyle(t).display!=='none').length; return {filas:rows, izq:Math.round(left+scrollY), der:Math.round(right+scrollY), dif:Math.round(right-left), overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};})()`);
    console.log(`MEDIDA ${n}`, JSON.stringify(r));
    check(`Panel ${n}: filas`, r.filas === (w >= 1280 ? 8 : 5) && !r.overflow);
  }
}

if (sections.includes('prefs')) {
  await size(1366, 768, false);
  await go('/settings');
  await ev(`localStorage.clear()`);
  await go('/settings');
  const saves = await ev(`[...document.querySelectorAll('main button')].filter(b=>/Guardar/.test(b.textContent)).map(b=>b.textContent.trim())`);
  check('un único botón de guardar, en el perfil', saves.length === 1 && saves[0] === 'Guardar cambios', saves);
  check('sin preferencias usa valores por defecto', (await ev(`document.querySelector('#pref-tips').getAttribute('aria-checked')`)) === 'true' && (await ev(`document.querySelector('#pref-motion').getAttribute('aria-checked')`)) === 'false');

  // Tablas compactas
  await go('/history');
  const h0 = await ev(`Math.round(document.querySelector('tbody tr').getBoundingClientRect().height)`);
  await go('/settings');
  await ev(toggle('pref-compact'));
  await go('/settings');
  check('tablas compactas persiste al recargar', (await ev(`document.querySelector('#pref-compact').getAttribute('aria-checked')`)) === 'true');
  await go('/history');
  const h1 = await ev(`Math.round(document.querySelector('tbody tr').getBoundingClientRect().height)`);
  check('tablas compactas reduce las filas del historial', h1 < h0, { antes: h0, despues: h1 });
  await go('/dashboard');
  check('el Panel no cambia con tablas compactas', (await ev(`Math.round(document.querySelector('tbody tr').getBoundingClientRect().height)`)) === h0);

  // Consejos
  await go('/settings');
  await ev(toggle('pref-tips'));
  await go('/analyzer');
  const t = await ev(`(()=>{const p=document.querySelector('[role=tabpanel]').getBoundingClientRect(); return {aside:!!document.querySelector('aside'), ancho:Math.round(p.width), main:Math.round(document.querySelector('main').clientWidth)};})()`);
  check('sin consejos el formulario ocupa el ancho', !t.aside && t.ancho > t.main - 100, t);

  // Reducir animaciones
  await go('/settings');
  await ev(toggle('pref-motion'));
  check('reducir animaciones marca <html>', await ev(`document.documentElement.hasAttribute('data-reduce-motion')`));
  await send('Page.navigate', { url: 'http://localhost:5173/settings' });
  await sleep(60);
  let firstOp = null;
  for (let i = 0; i < 40 && firstOp === null; i++) { firstOp = await ev(`(()=>{const h=document.querySelector('main h1'); return h?+getComputedStyle(h).opacity:null;})()`); if (firstOp === null) await sleep(25); }
  check('cabecera sin fundido al cargar', firstOp === 1, firstOp);
  await go('/results?demo=1', 300);
  check('veredicto sin revelado', (await ev(`+getComputedStyle(document.querySelector('[data-reveal]')).opacity`)) === 1);
  await go('/', 1500);
  const land = await ev(`(()=>{const els=[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2); return {total:els.length, ocultos:els.filter(e=>getComputedStyle(e).visibility==='hidden').length, lenis:document.documentElement.classList.contains('lenis')};})()`);
  check('portada sin revelados ni Lenis', land.total > 0 && land.ocultos === 0 && !land.lenis, land);
  const dur = await ev(`getComputedStyle(document.querySelector('a[href="/register"]')).transitionDuration`);
  check('CSS sin transiciones', parseFloat(dur) < 0.001, dur);
  await go('/settings');
  await ev(toggle('pref-motion'));
  await go('/', 1500);
  const land2 = await ev(`(()=>{const els=[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2); return {ocultos:els.filter(e=>getComputedStyle(e).visibility==='hidden').length, lenis:document.documentElement.classList.contains('lenis')};})()`);
  check('al desactivarla vuelven las animaciones', land2.ocultos > 0 && land2.lenis, land2);

  // Privacidad
  await go('/settings');
  await ev(toggle('priv-content'));
  await go('/settings');
  check('privacidad se recuerda', (await ev(`document.querySelector('#priv-content').getAttribute('aria-checked')`)) === 'true');
  // Robustez del almacenamiento
  const stored = await ev(`JSON.parse(localStorage.getItem('phishguard.preferences'))`);
  check('solo guarda las 5 preferencias', Object.keys(stored).sort().join() === 'compactTables,reduceMotion,saveHistory,showTips,storeContent', stored);
  await ev(`localStorage.setItem('phishguard.preferences','{no es json')`);
  await go('/settings');
  check('JSON corrupto: valores por defecto sin fallo', (await ev(`document.querySelector('#pref-tips').getAttribute('aria-checked')`)) === 'true');
  await ev(`localStorage.setItem('phishguard.preferences', JSON.stringify({showTips:'x', ajena:true, compactTables:true}))`);
  await go('/settings');
  check('valores inválidos se ignoran', (await ev(`document.querySelector('#pref-tips').getAttribute('aria-checked')`)) === 'true' && (await ev(`document.querySelector('#pref-compact').getAttribute('aria-checked')`)) === 'true');
  await ev(`Storage.prototype.setItem=function(){throw new Error('bloqueado')}; ${toggle('pref-compact')}`);
  check('almacenamiento bloqueado: el interruptor sigue funcionando', (await ev(`document.querySelector('#pref-compact').getAttribute('aria-checked')`)) === 'false');
  await go('/settings');
  await ev(`localStorage.clear()`);
}

if (sections.includes('dialog')) {
  for (const [n, w, h, m] of VIEW) {
    await size(w, h, m);
    await go('/settings');
    await ev(`${btn('Eliminar cuenta')}.scrollIntoView({block:'center'}); new Promise(r=>setTimeout(r,150))`);
    await ev(`${btn('Eliminar cuenta')}.focus(); ${btn('Eliminar cuenta')}.click(); new Promise(r=>setTimeout(r,200))`);
    const r = await ev(`(()=>{const d=document.querySelector('dialog[open]'); const b=d.getBoundingClientRect(); const a=document.activeElement; return {modal:d.matches(':modal'), foco:a.textContent.trim(), ancho:Math.round(b.width), dentro:b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight, altos:[...d.querySelectorAll('button')].map(x=>Math.round(x.getBoundingClientRect().height)), titulo:d.querySelector('h2').textContent, labelled:!!document.getElementById(d.getAttribute('aria-labelledby'))};})()`);
    check(`diálogo a ${n}: modal, foco en Cancelar y dentro de pantalla`, r.modal && r.foco === 'Cancelar' && r.dentro && r.labelled, r);
    await key('Escape', 'Escape', 27); await sleep(200);
    check(`diálogo a ${n}: Escape cierra y devuelve el foco`, !(await ev(`!!document.querySelector('dialog[open]')`)) && (await ev('document.activeElement.textContent.trim()')) === 'Eliminar cuenta', await ev('document.activeElement.textContent.trim()'));
  }
  await size(1366, 768, false);
  await go('/settings');
  // El foco se queda dentro
  await ev(`${btn('Borrar historial')}.click(); new Promise(r=>setTimeout(r,200))`);
  check('Borrar historial pide confirmación con su texto', (await ev(`document.querySelector('dialog[open] h2').textContent`)) === '¿Borrar todo el historial?');
  const seen = new Set();
  for (let i = 0; i < 6; i++) { await key('Tab', 'Tab', 9); await sleep(40); seen.add(await ev(`document.activeElement.closest('dialog')?'dentro':(document.activeElement===document.body?'navegador':'fuera:'+document.activeElement.textContent.trim().slice(0,20))`)); }
  check('el foco no llega a la página de fondo', ![...seen].some((s) => s.startsWith('fuera')), [...seen]);
  // Cancelar
  await ev(`[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent==='Cancelar').click(); new Promise(r=>setTimeout(r,200))`);
  check('Cancelar no ejecuta nada', !(await ev(`document.body.textContent.includes('Funcionalidad pendiente')`)) && !(await ev(`!!document.querySelector('dialog[open]')`)));
  // Clic fuera
  await ev(`${btn('Borrar historial')}.click(); new Promise(r=>setTimeout(r,200))`);
  await click(20, 700); await sleep(200);
  check('clic fuera cierra sin ejecutar', !(await ev(`!!document.querySelector('dialog[open]')`)) && !(await ev(`document.body.textContent.includes('Funcionalidad pendiente')`)));
  // Clic dentro no cierra
  await ev(`${btn('Borrar historial')}.click(); new Promise(r=>setTimeout(r,200))`);
  const inside = await ev(`(()=>{const r=document.querySelector('dialog[open] h2').getBoundingClientRect(); return {x:r.left+5,y:r.top+5};})()`);
  await click(inside.x, inside.y); await sleep(150);
  check('clic dentro no cierra', await ev(`!!document.querySelector('dialog[open]')`));
  // Confirmar
  await ev(`[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent==='Borrar historial').click(); new Promise(r=>setTimeout(r,250))`);
  check('Confirmar ejecuta la acción y cierra', (await ev(`document.body.textContent.includes('Borrar el historial se implementará')`)) && !(await ev(`!!document.querySelector('dialog[open]')`)));
  const v = await ev(`(()=>{const s=getComputedStyle(${btn('Borrar historial')}); return {color:s.color, borde:s.borderTopColor};})()`);
  check('Borrar historial se ve como acción de peligro', v.color === 'rgb(255, 90, 79)', v);
}

if (sections.includes('c5')) {
  for (const [n, w, h, m] of [...VIEW]) {
    await size(w, h, m);
    await go('/results');
    if (m) await ev(`document.querySelector('button[aria-controls=mobile-menu]').click(); new Promise(r=>setTimeout(r,500))`);
    const sel = m ? '#mobile-menu ul a' : 'nav ul a';
    const links = await ev(`[...document.querySelectorAll('${sel}')].map(a=>({t:a.textContent.replace(/^\\d+/,'').trim(), on:a.getAttribute('aria-current')==='page'}))`);
    check(`navegación a ${n}`, links.map((l) => l.t).join() === 'Panel,Analizador,Historial,Administración', links.map((l) => l.t));
    check(`Historial activo en /results a ${n}`, links.filter((l) => l.on).map((l) => l.t).join() === 'Historial', links.filter((l) => l.on));
  }
  await size(1366, 768, false);
  await go('/results?demo=1&id=demo-1041');
  check('Historial activo al abrir un informe', (await ev(`document.querySelector('nav ul a[aria-current=page]').textContent`)) === 'Historial');
  await go('/admin');
  check('Administración activa en su página', (await ev(`document.querySelector('nav ul a[aria-current=page]').textContent`)) === 'Administración');
  await go('/history');
  check('Historial activo en su página', (await ev(`document.querySelector('nav ul a[aria-current=page]').textContent`)) === 'Historial');
  await go('/results');
  const e = await ev(`({t:document.querySelector('main h3').textContent, a:[...document.querySelectorAll('main a, main button')].map(x=>x.textContent.trim())})`);
  check('estado vacío con salidas claras', e.t === 'Elige un análisis para ver su informe' && e.a.includes('Ir al historial') && e.a.includes('Nuevo análisis') && e.a.includes('Ver ejemplo'), e);
  await ev(`[...document.querySelectorAll('main a')].find(a=>a.textContent.includes('Ir al historial')).click(); new Promise(r=>setTimeout(r,400))`);
  check('Ir al historial funciona', (await ev('location.pathname')) === '/history');
  await go('/results');
  await ev(`${btn('Ver ejemplo')}.click(); new Promise(r=>setTimeout(r,500))`);
  check('Ver ejemplo abre el informe', (await ev('location.search')) === '?demo=1');
}

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);
