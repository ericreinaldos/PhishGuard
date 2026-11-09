import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const sections = (process.argv[2] ?? 'c3,c2,b4').split(',');
const profile = join(here, 'profile-b4t');
const PORT = 9341;
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
const go = async (p, wait = 1300) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(wait); };
const key = async (k, code, vk, mods = 0) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, modifiers: mods }); };
const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
const check = (name, ok, detail) => { console.log(`${ok ? 'OK   ' : 'FALLA'} ${name}${detail !== undefined ? ' -> ' + JSON.stringify(detail) : ''}`); if (!ok) process.exitCode = 2; };
const btn = (t) => `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(t)})`;
const setValue = (sel, v, proto = 'HTMLTextAreaElement') => `(()=>{const i=document.querySelector('${sel}'); Object.getOwnPropertyDescriptor(${proto}.prototype,'value').set.call(i,${JSON.stringify(v)}); i.dispatchEvent(new Event('input',{bubbles:true}));})(); new Promise(r=>setTimeout(r,120))`;
const tab = (m) => `document.querySelector('#analyzer-tab-${m}').click(); new Promise(r=>setTimeout(r,250))`;
await send('Page.enable'); await send('Runtime.enable');

if (sections.includes('c3')) {
  await size(1366, 768, false);
  await go('/analyzer');
  await ev(setValue('#message-input', 'Mensaje de prueba que debe conservarse al cambiar de pestaña'));
  await ev(tab('url'));
  check('la pestaña URL empieza vacía', (await ev(`document.querySelector('#url-input').value`)) === '');
  await ev(setValue('#url-input', 'no-es-una-url', 'HTMLInputElement'));
  await ev(tab('headers'));
  await ev(setValue('#headers-input', 'Received: from prueba'));
  await ev(tab('message'));
  check('mensaje conservado', (await ev(`document.querySelector('#message-input').value`)).startsWith('Mensaje de prueba'));
  await ev(tab('headers'));
  check('cabeceras conservadas', (await ev(`document.querySelector('#headers-input').value`)) === 'Received: from prueba');
  await ev(tab('url'));
  check('URL conservada y su validación visible', (await ev(`document.querySelector('#url-input').value`)) === 'no-es-una-url' && (await ev(`document.querySelectorAll('[role=alert]').length`)) === 1);
  await ev(`${btn('Limpiar')}.click(); new Promise(r=>setTimeout(r,120))`);
  check('Limpiar solo borra su pestaña', (await ev(`document.querySelector('#url-input').value`)) === '');
  await ev(tab('message'));
  check('Limpiar no afecta a otras pestañas', (await ev(`document.querySelector('#message-input').value`)).startsWith('Mensaje de prueba'));
  check('nada persiste en el navegador', (await ev(`JSON.stringify(Object.keys(localStorage).concat(Object.keys(sessionStorage)).map(k=>(localStorage.getItem(k)||sessionStorage.getItem(k)||'')).filter(v=>v.includes('Mensaje de prueba')))`)) === '[]');
  await go('/analyzer');
  check('recargar no restaura el texto', (await ev(`document.querySelector('#message-input').value`)) === '');

  // Salto arriba
  await ev(`window.scrollTo(0,300); new Promise(r=>setTimeout(r,200))`);
  await ev(tab('headers'));
  check('clic en pestaña mantiene el scroll', (await ev('Math.round(scrollY)')) === 300, await ev('Math.round(scrollY)'));
  await ev(`document.querySelector('#analyzer-tab-headers').focus()`);
  await key('ArrowLeft', 'ArrowLeft', 37); await sleep(250);
  check('flecha mantiene scroll y foco', (await ev('Math.round(scrollY)')) === 300 && (await ev('document.activeElement.id')) === 'analyzer-tab-url', { y: await ev('Math.round(scrollY)'), foco: await ev('document.activeElement.id') });
  await ev(`[...document.querySelectorAll('nav ul a')].find(a=>a.textContent==='Historial').click(); new Promise(r=>setTimeout(r,500))`);
  check('cambiar de página sigue yendo arriba', (await ev('Math.round(scrollY)')) === 0);
  await go('/history');
  await ev(`window.scrollTo(0,300); new Promise(r=>setTimeout(r,200))`);
  await ev(`[...document.querySelectorAll('nav ul a')].find(a=>a.textContent==='Historial').click(); new Promise(r=>setTimeout(r,400))`);
  check('repetir un enlace sigue subiendo', (await ev('Math.round(scrollY)')) === 0, await ev('Math.round(scrollY)'));
  await go('/results');
  await ev(`window.scrollTo(0,100); new Promise(r=>setTimeout(r,100))`);
  await ev(`${btn('Ver ejemplo de demostración')}.click(); new Promise(r=>setTimeout(r,400))`);
  check('Resultados: abrir la demostración va arriba', (await ev('Math.round(scrollY)')) === 0);

  // Consejos
  const tips = `(()=>{const o=document.querySelector('aside ol'); return getComputedStyle(o).display;})()`;
  check('escritorio: consejos visibles', (await (async () => { await go('/analyzer'); return ev(tips); })()) !== 'none');
  check('escritorio: sin botón de plegar', (await ev(`getComputedStyle(document.querySelector('aside button')).display`)) === 'none');
  await size(375, 812, true);
  await go('/analyzer');
  check('móvil: consejos plegados', (await ev(tips)) === 'none');
  check('móvil: privacidad visible', await ev(`(()=>{const p=[...document.querySelectorAll('main p')].find(x=>x.textContent.startsWith('En esta versión')); return p.getBoundingClientRect().height>0;})()`));
  await ev(`document.querySelector('aside button').click(); new Promise(r=>setTimeout(r,150))`);
  check('móvil: se pueden desplegar', (await ev(tips)) !== 'none' && (await ev(`document.querySelector('aside button').getAttribute('aria-expanded')`)) === 'true');
  await ev(`document.querySelector('aside button').click(); new Promise(r=>setTimeout(r,150))`);
  check('móvil: botón de 44 px', (await ev(`Math.round(document.querySelector('aside button').getBoundingClientRect().height)`)) === 44);

  // Resultado en vista y con foco
  for (const [n, w, h, m] of [['375x812', 375, 812, true], ['1366x768', 1366, 768, false], ['1536x730', 1536, 730, false], ['1440x900', 1440, 900, false]]) {
    await size(w, h, m);
    await go('/analyzer');
    await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,150))`);
    await ev(`${btn('Analizar')}.scrollIntoView({block:'center'}); new Promise(r=>setTimeout(r,200))`);
    await ev(`${btn('Analizar')}.click(); new Promise(r=>setTimeout(r,2200))`);
    const r = await ev(`(()=>{const t=document.querySelector('#result-title').getBoundingClientRect(); return {top:Math.round(t.top), vh:innerHeight, foco:document.activeElement.id};})()`);
    check(`resultado visible y enfocado a ${n}`, r.top >= 64 && r.top < r.vh && r.foco === 'result-title', r);
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await size(375, 812, true);
  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,150))`);
  await ev(`${btn('Analizar')}.click(); new Promise(r=>setTimeout(r,1800))`);
  const rr = await ev(`Math.round(document.querySelector('#result-title').getBoundingClientRect().top)`);
  check('movimiento reducido: también lo lleva a la vista', rr >= 64 && rr < 812, rr);
  await send('Emulation.setEmulatedMedia', { features: [] });
}

if (sections.includes('c2')) {
  const rowInfo = `(()=>{const t=document.querySelector('table'); const w=t.parentElement; const svg=[...t.querySelectorAll('tbody tr:first-child svg')].pop().getBoundingClientRect(); const wr=w.getBoundingClientRect(); return {client:w.clientWidth, scroll:w.scrollWidth, chevronVisible:svg.right<=wr.right+1, rowH:Math.round(t.querySelector('tbody tr').getBoundingClientRect().height), headers:[...t.querySelectorAll('th')].filter(th=>getComputedStyle(th).display!=='none').map(th=>th.textContent)};})()`;
  for (const [p, w, h, m] of [['/history', 320, 640, true], ['/history', 375, 812, true], ['/dashboard', 375, 812, true], ['/history', 640, 900, true], ['/history', 768, 1024, true], ['/history', 1024, 768, false], ['/history', 1366, 768, false], ['/dashboard', 1366, 768, false], ['/history', 1536, 730, false], ['/history', 1440, 900, false]]) {
    await size(w, h, m);
    await go(p);
    const r = await ev(rowInfo);
    check(`${p} a ${w}: sin scroll en tabla y flecha visible`, r.scroll <= r.client && r.chevronVisible, r);
  }
  // Clic en cualquier parte de la fila
  await size(1366, 768, false);
  await go('/history');
  await ev(`document.querySelector('table').scrollIntoView({block:'center'}); new Promise(r=>setTimeout(r,200))`);
  for (const [name, sel] of [['veredicto', 'td:nth-child(4)'], ['fecha', 'td:nth-child(3)'], ['contenido', 'td:nth-child(1)']]) {
    const p = await ev(`(()=>{const r=document.querySelector('tbody tr:nth-child(2) ${sel}').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
    await click(p.x, p.y); await sleep(500);
    check(`clic en ${name} abre el detalle`, (await ev('location.pathname+location.search')).startsWith('/results?demo=1&id='), await ev('location.search'));
    await go('/history');
    await ev(`document.querySelector('table').scrollIntoView({block:'center'}); new Promise(r=>setTimeout(r,200))`);
  }
  // Móvil: toque en el centro de la fila
  await size(375, 812, true);
  await go('/history');
  await ev(`document.querySelector('table').scrollIntoView({block:'center'}); new Promise(r=>setTimeout(r,200))`);
  const pm = await ev(`(()=>{const r=document.querySelector('tbody tr:nth-child(2)').getBoundingClientRect(); return {x:r.left+r.width-20,y:r.top+r.height/2};})()`);
  await click(pm.x, pm.y); await sleep(500);
  check('móvil: tocar la flecha abre el detalle', (await ev('location.pathname')) === '/results');
  // Teclado
  await size(1366, 768, false);
  await go('/history');
  await ev(`document.querySelector('table a').focus()`);
  const a11y = await ev(`(()=>{const a=document.activeElement; const ls=getComputedStyle(a,'::after'); return {name:a.textContent.slice(0,44), after:ls.outlineStyle+' '+ls.outlineWidth, enlacesPorFila:document.querySelectorAll('tbody tr:first-child a').length};})()`);
  check('una sola parada de teclado por fila y nombre accesible', a11y.enlacesPorFila === 1 && a11y.name.startsWith('Ver detalle del análisis'), a11y);
  await go('/history');
  await ev(`[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Alto')[0].focus()`);
  await key('Tab', 'Tab', 9); await sleep(100);
  const ring = await ev(`(()=>{const a=document.activeElement; const s=getComputedStyle(a,'::after'); return {tag:a.tagName, enTabla:!!a.closest('table'), outline:s.outlineStyle+' '+s.outlineWidth, color:s.outlineColor};})()`);
  check('Tab llega a la fila y se ve el foco sobre ella', ring.enTabla && ring.outline === 'solid 2px', ring);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await sleep(500);
  check('Enter en la fila abre el detalle', (await ev('location.pathname')) === '/results', await ev('location.pathname'));
  // Administración usa DataTable sin enlaces
  await go('/admin');
  const adm = await ev(`(()=>{const t=[...document.querySelectorAll('table')].find(x=>x.querySelector('caption')?.textContent.includes('Actividad reciente')); return {enlaces:t.querySelectorAll('a').length, headers:[...t.querySelectorAll('th')].map(h=>h.textContent)};})()`);
  check('Administración: su tabla no cambia', adm.enlaces === 0 && adm.headers.includes('Evento'), adm);
}

if (sections.includes('b4')) {
  await size(1366, 768, false);
  await go('/history');
  check('sin filtros no aparece Limpiar', !(await ev(`!!${btn('Limpiar filtros')}`)));
  const y0 = await ev(`Math.round(document.querySelector('table').getBoundingClientRect().top+scrollY)`);
  await ev(`${btn('Alto')}.click(); new Promise(r=>setTimeout(r,200))`);
  check('con filtro aparece Limpiar', await ev(`!!${btn('Limpiar filtros')}`));
  const y1 = await ev(`Math.round(document.querySelector('table').getBoundingClientRect().top+scrollY)`);
  check('la tabla no salta al aparecer el botón', y0 === y1, { y0, y1 });
  const count = await ev(`[...document.querySelectorAll('[aria-live=polite]')].find(e=>e.textContent.includes('de 8')).textContent`);
  await ev(`${btn('Limpiar filtros')}.click(); new Promise(r=>setTimeout(r,200))`);
  check('Limpiar restablece todo y enfoca la búsqueda', (await ev(`[...document.querySelectorAll('[aria-live=polite]')].find(e=>e.textContent.includes('de 8')).textContent`)).startsWith('8 de 8') && (await ev('document.activeElement.id')) === 'history-search', { antes: count });
  await ev(setValue('#history-search', 'zzzz', 'HTMLInputElement'));
  check('sin resultados: un solo botón Limpiar', (await ev(`[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Limpiar filtros').length`)) === 1);
  await ev(setValue('#history-search', 'cuenta', 'HTMLInputElement'));
  check('la búsqueda también activa Limpiar', await ev(`!!${btn('Limpiar filtros')}`));
  const gap = await ev(`(()=>{const p=[...document.querySelectorAll('[aria-live=polite]')].find(e=>e.textContent.includes('de 8')); const c=p.parentElement.getBoundingClientRect(); return Math.round(document.querySelector('table').getBoundingClientRect().top-c.bottom);})()`);
  check('espacio de 16 px entre contador y tabla', gap === 16, gap);
  await size(375, 812, true);
  await go('/history');
  await ev(`${btn('Alto')}.click(); new Promise(r=>setTimeout(r,200))`);
  check('móvil: botón de 40 px', (await ev(`Math.round(${btn('Limpiar filtros')}.getBoundingClientRect().height)`)) === 40);
}

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);

