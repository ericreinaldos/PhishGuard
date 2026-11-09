import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2] ?? 'subtle';
const profile = join(here, `profile-b3t-${mode}`);
const PORT = 9339;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'ERR ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200); return r.result.value; };
const go = async (p, wait = 1500) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(wait); };
const check = (name, ok, detail) => { console.log(`${ok ? 'OK   ' : 'FALLA'} ${name}${detail !== undefined ? ' -> ' + JSON.stringify(detail) : ''}`); if (!ok) process.exitCode = 2; };
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const ctrlEnter = async (mods = 2) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, modifiers: mods, ...(type === 'keyDown' ? { text: '\r' } : {}) }); };
const status = `document.querySelector('section[aria-labelledby=result-title] span')?.textContent`;

if (mode === 'subtle') {
  // Ctrl+Enter en cada modalidad
  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); document.querySelector('textarea').focus(); new Promise(r=>setTimeout(r,200))`);
  const before = await ev(`document.querySelector('textarea').value`);
  await ctrlEnter(); await sleep(1500);
  check('mensaje: Ctrl+Enter analiza', (await ev(status)) === 'Motor pendiente', await ev(status));
  check('mensaje: Ctrl+Enter no añade salto de línea', (await ev(`document.querySelector('textarea').value`)) === before);

  await go('/analyzer');
  await ev(`document.querySelector('textarea').focus()`);
  await ctrlEnter(); await sleep(400);
  check('mensaje vacío: muestra error y mantiene foco', (await ev(`document.activeElement.id`)) === 'message-input' && (await ev(`document.querySelectorAll('[role=alert]').length`)) > 0);

  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); document.querySelector('textarea').focus(); new Promise(r=>setTimeout(r,200))`);
  await ctrlEnter(4); await sleep(1500);
  check('Cmd+Enter también analiza', (await ev(status)) === 'Motor pendiente');

  await go('/analyzer');
  await ev(`document.querySelector('textarea').focus()`);
  for (const type of ['keyDown', 'char', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, ...(type !== 'keyUp' ? { text: '\r' } : {}) });
  await sleep(250);
  check('Enter solo no envía desde el campo de texto', (await ev(status)) === 'En espera', await ev(status));

  await go('/analyzer?mode=url');
  await ev(`(()=>{const i=document.querySelector('#url-input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'https://ejemplo.com/acceso'); i.dispatchEvent(new Event('input',{bubbles:true})); i.focus();})(); new Promise(r=>setTimeout(r,150))`);
  await ctrlEnter(); await sleep(1500);
  check('URL: Ctrl+Enter analiza', (await ev(status)) === 'Motor pendiente', await ev(status));

  await go('/analyzer?mode=headers');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); document.querySelector('textarea').focus(); new Promise(r=>setTimeout(r,200))`);
  await ctrlEnter(); await sleep(1500);
  check('cabeceras: Ctrl+Enter analiza', (await ev(status)) === 'Motor pendiente', await ev(status));

  // Pista
  await go('/analyzer');
  const hint = `(() => { const p=[...document.querySelectorAll('form p')].find(x=>x.textContent==='Ctrl+Enter para analizar'); return p?{display:getComputedStyle(p).display,size:getComputedStyle(p).fontSize,color:getComputedStyle(p).color}:null; })()`;
  const h = await ev(hint);
  check('pista visible en escritorio', h?.display === 'block', h);
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  await go('/analyzer');
  check('pista oculta en móvil', (await ev(hint))?.display === 'none');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
}

// B9: comportamiento según APP_MOTION
const hiddenSections = `(() => { const els=[...document.querySelectorAll('section [data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight); return { total:els.length, ocultos:els.filter(e=>getComputedStyle(e).visibility==='hidden'||+getComputedStyle(e).opacity<0.05).length }; })()`;
await go('/dashboard', 1800);
const sec = await ev(hiddenSections);
const headerAt = async () => { await send('Page.navigate', { url: 'http://localhost:5173/settings' }); await sleep(900); return ev(`+getComputedStyle(document.querySelector('main h1')).opacity`); };
const h1Op = await headerAt();
if (mode === 'subtle') {
  check('subtle: secciones visibles sin esperar al scroll', sec.total > 0 && sec.ocultos === 0, sec);
  check('subtle: cabecera completamente visible tras el fundido', h1Op === 1, h1Op);
  // El veredicto sigue siendo el único revelado de la app: se anima y termina visible
  await go('/results?demo=1', 0);
  let first = null;
  for (let i = 0; i < 40 && first === null; i++) {
    first = await ev(`(() => { const e=document.querySelector('[data-reveal]'); return e ? +getComputedStyle(e).opacity : null; })()`);
    if (first === null) await sleep(25);
  }
  await sleep(1800);
  const late = await ev(`+getComputedStyle(document.querySelector('[data-reveal]')).opacity`);
  check('veredicto: se revela y termina visible', first < 1 && late === 1, { inicial: first, final: late });
} else {
  check('full: secciones ocultas hasta el scroll', sec.total > 0 && sec.ocultos > 0, sec);
}

// Portada: sus revelados no dependen de APP_MOTION
await go('/', 2000);
const land = await ev(`(() => { const els=[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2); return { total:els.length, ocultos:els.filter(e=>getComputedStyle(e).visibility==='hidden').length }; })()`);
check('portada: los revelados siguen activos', land.total > 0 && land.ocultos > 0, land);

// Movimiento reducido
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await go('/dashboard', 1000);
check('reducido: cabecera visible al instante', (await ev(`+getComputedStyle(document.querySelector('main h1')).opacity`)) === 1);
await send('Emulation.setEmulatedMedia', { features: [] });

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);
