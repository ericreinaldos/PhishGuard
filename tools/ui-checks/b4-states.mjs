// Capturas de estados del bloque 4: funciona igual antes y después de los cambios.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const outDir = join(here, 'b3', label);
mkdirSync(outDir, { recursive: true });
const profile = join(here, `profile-b4s-${label}`);
const PORT = 9340;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
const size = (w, h, s, m) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: s, mobile: m });
const go = async (p) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(1800); };
const shot = async (name, w, h) => { const sy = await ev('window.scrollY'); const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: sy, width: w, height: h, scale: 1 } }); writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64')); };
const VIEW = [['1440x900', 1440, 900, 1, false], ['1366x768', 1366, 768, 1, false], ['1536x730', 1536, 730, 1.25, false], ['375x812', 375, 812, 2, true]];
const out = {};
await send('Page.enable'); await send('Runtime.enable');
for (const [vn, w, h, s, m] of VIEW) {
  await size(w, h, s, m);
  // Analizador tras enviar con el botón centrado, como lo vería quien acaba de pulsarlo
  await go('/analyzer');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,200))`);
  await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Analizar'); b.scrollIntoView({block:'center'});})(); new Promise(r=>setTimeout(r,300))`);
  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Analizar').click(); new Promise(r=>setTimeout(r,2000))`);
  out[`submit-${vn}`] = await ev(`(()=>{const t=document.querySelector('#result-title').getBoundingClientRect(); return {resultTop:Math.round(t.top), vh:innerHeight, visible:t.top>=0&&t.top<innerHeight, active:document.activeElement.id||document.activeElement.tagName};})()`);
  await shot(`analyzer-submit-${vn}`, w, h);
  // Historial con filtro activo, encuadrado en la tabla
  await go('/history');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Alto').click(); new Promise(r=>setTimeout(r,250))`);
  await ev(`(()=>{const t=document.querySelector('table'); window.scrollTo(0, t.getBoundingClientRect().top+scrollY-170);})(); new Promise(r=>setTimeout(r,400))`);
  out[`history-${vn}`] = await ev(`(()=>{const t=document.querySelector('table'); const w=t.parentElement; const a=t.querySelector('a'); const r=a.getBoundingClientRect(); const c=[...t.querySelectorAll('tbody tr:first-child svg')].pop().getBoundingClientRect(); return {wrapClient:w.clientWidth, wrapScroll:w.scrollWidth, chevronRight:Math.round(c.right), wrapRight:Math.round(w.getBoundingClientRect().right), chevronVisible:c.right<=w.getBoundingClientRect().right+1, clearVisible:[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Limpiar filtros')};})()`);
  await shot(`history-filter-${vn}`, w, h);
}
writeFileSync(join(outDir, 'states.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
