import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const profile = join(here, 'profile-b7t');
const PORT = 9346;
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
const reduceMedia = (on) => send('Emulation.setEmulatedMedia', { features: on ? [{ name: 'prefers-reduced-motion', value: 'reduce' }] : [] });
const note = `(()=>{const p=[...document.querySelectorAll('main p')].find(x=>x.textContent.includes('nada sale de tu navegador')); if(!p) return null; const r=p.getBoundingClientRect(); return {h:Math.round(r.height), dentroDeConsejos:!!p.closest('aside'), right:Math.round(r.right), vw:innerWidth};})()`;

// --- Nota de privacidad
for (const [n, w, h, m] of VIEW) {
  await size(w, h, m);
  await go('/settings'); await ev('localStorage.clear()');
  for (const [estado, tips] of [['con consejos', true], ['sin consejos', false]]) {
    if (!tips) { await go('/settings'); await ev(`document.querySelector('#pref-tips').click(); new Promise(r=>setTimeout(r,150))`); }
    for (const mode of ['', '?mode=url', '?mode=headers']) {
      await go('/analyzer' + mode, 1000);
      const r = await ev(note);
      check(`nota visible a ${n} ${estado} ${mode || 'mensaje'}`, r && r.h > 0 && !r.dentroDeConsejos && r.right <= r.vw, r);
    }
  }
  await go('/settings'); await ev('localStorage.clear()');
}
await size(375, 812, true);
await go('/analyzer');
const fold = await ev(`(()=>{const a=document.querySelector('aside'); const panel=a.firstElementChild.getBoundingClientRect(); return {altoPanelPlegado:Math.round(panel.height), consejos:getComputedStyle(a.querySelector('ol')).display};})()`);
check('móvil: panel plegado sin hueco', fold.altoPanelPlegado < 60 && fold.consejos === 'none', fold);

// --- prefers-reduced-motion con el interruptor APAGADO
await reduceMedia(true);
for (const [n, w, h, m] of VIEW) {
  await size(w, h, m);
  await go('/settings'); await ev('localStorage.clear()');
  await go('/settings');
  check(`sistema reducido a ${n}: el interruptor sigue apagado`, (await ev(`document.querySelector('#pref-motion').getAttribute('aria-checked')`)) === 'false' && !(await ev(`document.documentElement.hasAttribute('data-reduce-motion')`)));
  await go('/', 1500);
  const l = await ev(`(()=>{const els=[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2); const s=[...document.querySelectorAll('[data-hero-letter]')][0]; return {total:els.length, ocultos:els.filter(e=>getComputedStyle(e).visibility==='hidden').length, lenis:document.documentElement.classList.contains('lenis'), dur:getComputedStyle(document.querySelector('header')).transitionDuration, letra:getComputedStyle(s).transform};})()`);
  check(`sistema reducido a ${n}: portada sin revelados, Lenis ni transiciones`, l.total > 0 && l.ocultos === 0 && !l.lenis && parseFloat(l.dur) < 0.001, l);
  await send('Page.navigate', { url: 'http://localhost:5173/results?demo=1' });
  let v = null;
  for (let i = 0; i < 60 && v === null; i++) { v = await ev(`(()=>{const e=document.querySelector('[data-reveal]'); return e?+getComputedStyle(e).opacity:null;})()`); if (v === null) await sleep(25); }
  check(`sistema reducido a ${n}: veredicto sin animación desde el primer momento`, v === 1, v);
  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,150))`);
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Analizar').click(); new Promise(r=>setTimeout(r,1500))`);
  const t = await ev(`Math.round(document.querySelector('#result-title').getBoundingClientRect().top)`);
  check(`sistema reducido a ${n}: resultado a la vista`, t >= 64 && t < h, t);
}
// Encender y apagar el interruptor no anula la preferencia del sistema
await size(1366, 768, false);
await go('/settings');
await ev(`document.querySelector('#pref-motion').click(); new Promise(r=>setTimeout(r,150))`);
await ev(`document.querySelector('#pref-motion').click(); new Promise(r=>setTimeout(r,150))`);
await go('/', 1500);
const after = await ev(`({lenis:document.documentElement.classList.contains('lenis'), ocultos:[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2&&getComputedStyle(e).visibility==='hidden').length})`);
check('apagar el interruptor no reactiva nada si el sistema lo pide', !after.lenis && after.ocultos === 0, after);
await reduceMedia(false);
await go('/', 1500);
const free = await ev(`({lenis:document.documentElement.classList.contains('lenis'), ocultos:[...document.querySelectorAll('[data-reveal]')].filter(e=>e.getBoundingClientRect().top>innerHeight*1.2&&getComputedStyle(e).visibility==='hidden').length})`);
check('sin preferencia del sistema vuelven las animaciones', free.lenis && free.ocultos > 0, free);
await go('/settings'); await ev('localStorage.clear()');

ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(process.exitCode ?? 0);
