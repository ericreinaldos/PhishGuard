import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const profile = join(here, 'profile4');
const BASE = 'http://localhost:5173';
const PORT = 9336;
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
const go = async (p) => { await send('Page.navigate', { url: BASE + p }); await sleep(1500); };
const key = async (k, code, vk, shift = false) => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers: shift ? 8 : 0 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers: shift ? 8 : 0 }); };
const active = `(document.activeElement.id||document.activeElement.getAttribute('aria-label')||document.activeElement.textContent.trim().slice(0,28)||document.activeElement.tagName)`;
const check = (name, ok, detail) => { console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${detail !== undefined ? ' -> ' + JSON.stringify(detail) : ''}`); if (!ok) process.exitCode = 2; };
await send('Page.enable'); await send('Runtime.enable');
await size(1440, 900, false);

// Orden de tabulación en login
await go('/login');
const order = [];
for (let i = 0; i < 9; i++) { await key('Tab', 'Tab', 9); order.push(await ev(active)); }
const pw = order.indexOf('password'); const forgot = order.findIndex((s) => s.startsWith('¿Olvidaste'));
check('login: contraseña antes que recuperación', pw >= 0 && forgot > pw, order);

// Envío vacío: foco en el primer error y anuncio
for (const [path, btn, expectFocus] of [['/login', 'Iniciar sesión', 'email'], ['/register', 'Crear cuenta', 'name'], ['/analyzer', 'Analizar', 'message-input'], ['/analyzer?mode=url', 'Analizar', 'url-input'], ['/analyzer?mode=headers', 'Analizar', 'headers-input']]) {
  await go(path);
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(btn)}).click(); new Promise(r=>setTimeout(r,250))`);
  const a = await ev(active); const alerts = await ev(`[...document.querySelectorAll('[role=alert]')].map(e=>e.textContent.trim())`);
  check(`envío vacío ${path}`, a === expectFocus && alerts.length > 0, { foco: a, alertas: alerts });
}
// URL con formato inválido
await go('/analyzer?mode=url');
await ev(`(()=>{const i=document.querySelector('#url-input'); const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; s.call(i,'esto no es url'); i.dispatchEvent(new Event('input',{bubbles:true}));})(); [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Analizar').click(); new Promise(r=>setTimeout(r,250))`);
check('URL inválida muestra su error', (await ev(`document.querySelector('[role=alert]')?.textContent.trim()`))?.startsWith('No parece'), await ev(`document.querySelector('[role=alert]')?.textContent.trim()`));

// Cambiar de pestaña no debe robar el foco
await go('/analyzer');
await ev(`document.querySelector('#analyzer-tab-message').focus()`);
await key('ArrowRight', 'ArrowRight', 39); await sleep(300);
check('flecha en pestañas mantiene foco', (await ev(`document.activeElement.id`)) === 'analyzer-tab-url', await ev(`document.activeElement.id`));
// Comportamiento previo: posición de scroll al cambiar pestaña
await ev(`window.scrollTo(0,500); new Promise(r=>setTimeout(r,200))`);
await ev(`document.querySelector('#analyzer-tab-headers').click(); new Promise(r=>setTimeout(r,300))`);
console.log('INFO scrollY tras cambiar pestaña (partía de 500):', await ev('Math.round(scrollY)'));

// Foco al cambiar de página
await go('/dashboard');
await ev(`[...document.querySelectorAll('nav ul a')].find(a=>a.textContent==='Historial').click(); new Promise(r=>setTimeout(r,500))`);
check('foco en main al navegar', (await ev(`document.activeElement.id`)) === 'contenido', await ev(`document.activeElement.id`));
const outlineMain = await ev(`getComputedStyle(document.querySelector('main')).outlineColor`);
console.log('INFO outline main:', outlineMain);
await go('/login');
await ev(`document.querySelectorAll('h1,h2').length; [...document.querySelectorAll('a')].find(a=>a.getAttribute('href')==='/register').click(); new Promise(r=>setTimeout(r,500))`);
check('foco en main al pasar a registro', (await ev(`document.activeElement.id`)) === 'contenido');

// Menú móvil
await size(375, 812, true);
await go('/dashboard');
await ev(`document.querySelector('button[aria-controls=mobile-menu]').click(); new Promise(r=>setTimeout(r,400))`);
check('menú: fondo inert', await ev(`document.querySelector('main').hasAttribute('inert') && document.querySelector('footer').hasAttribute('inert')`));
check('menú: foco en primer enlace', (await ev(active)).includes('Panel'), await ev(active));
await key('Escape', 'Escape', 27); await sleep(300);
check('Escape: cierra y devuelve el foco', (await ev(`document.activeElement.getAttribute('aria-controls')`)) === 'mobile-menu' && !(await ev(`document.querySelector('main').hasAttribute('inert')`)));
await ev(`document.querySelector('button[aria-controls=mobile-menu]').click(); new Promise(r=>setTimeout(r,400))`);
await ev(`[...document.querySelectorAll('#mobile-menu a')].find(a=>a.textContent.includes('Historial')).click(); new Promise(r=>setTimeout(r,600))`);
check('navegar desde menú: foco en main y sin inert', (await ev(`document.activeElement.id`)) === 'contenido' && !(await ev(`document.querySelector('main').hasAttribute('inert')`)), await ev(`document.activeElement.id`));

// Zonas táctiles reales
const targets = `(() => { const r=[]; for(const el of document.querySelectorAll('a,button,input:not([type=hidden]),textarea,[role=tab],[role=switch]')){ const s=getComputedStyle(el); const b=el.getBoundingClientRect(); if(s.visibility==='hidden'||s.display==='none'||b.width<2||b.height===0) continue; if(b.height<44){ const inTable=!!el.closest('table'); const inline=s.display==='inline'; r.push((el.getAttribute('aria-label')||el.textContent||el.id||el.tagName).trim().slice(0,22)+'='+Math.round(b.width)+'x'+Math.round(b.height)+(inTable?'(tabla)':'')+(inline?'(en línea)':'')); } } return [...new Set(r)]; })()`;
for (const p of ['/login', '/register', '/analyzer', '/analyzer?mode=url', '/history', '/settings', '/admin', '/']) { await go(p); console.log('TÁCTIL <44', p, JSON.stringify(await ev(targets))); }

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);
