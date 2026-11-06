import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const outDir = join(here, 'b6', label);
mkdirSync(outDir, { recursive: true });
const profile = join(here, `profile-b6-${label}`);
const PORT = 9345;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
await send('Page.enable'); await send('Runtime.enable');
const VIEW = [['1440x900', 1440, 900, 1, false], ['1366x768', 1366, 768, 1, false], ['1536x730', 1536, 730, 1.25, false], ['375x812', 375, 812, 2, true]];
const go = async (p) => { await send('Page.navigate', { url: 'http://localhost:5173' + p }); await sleep(2000); };
const shot = async (name, w, h) => { const sy = await ev('window.scrollY'); const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: sy, width: w, height: h, scale: 1 } }); writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64')); };
const full = async (name, w, scale) => { const H = await ev('document.documentElement.scrollHeight'); const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: H, scale: 1 / scale } }); writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64')); };
const out = {};
for (const [vn, w, h, s, m] of VIEW) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: s, mobile: m });
  await go('/settings'); await ev('localStorage.clear()');
  await go('/dashboard');
  await full(`dashboard-${vn}-full`, w, s);
  await go('/results');
  await shot(`results-empty-${vn}`, w, h);
  await go('/settings');
  await shot(`settings-${vn}`, w, h);
  await full(`settings-${vn}-full`, w, s);
  await go('/history');
  await shot(`history-${vn}`, w, h);
  out[vn] = await ev(`({histH:Math.round(document.querySelector('tbody tr').getBoundingClientRect().height)})`);
  if (label === 'after') {
    await go('/settings');
    await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Eliminar cuenta').click(); new Promise(r=>setTimeout(r,300))`);
    await shot(`dialog-${vn}`, w, h);
    await ev(`[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent==='Cancelar').click(); new Promise(r=>setTimeout(r,150))`);
    await ev(`document.querySelector('#pref-compact').click(); document.querySelector('#pref-tips').click(); new Promise(r=>setTimeout(r,200))`);
    await go('/history');
    await ev(`(()=>{const t=document.querySelector('table'); window.scrollTo(0, t.getBoundingClientRect().top+scrollY-170);})(); new Promise(r=>setTimeout(r,300))`);
    await shot(`history-dense-${vn}`, w, h);
    await go('/analyzer');
    await shot(`analyzer-notips-${vn}`, w, h);
    await go('/settings'); await ev('localStorage.clear()');
  }
}
writeFileSync(join(outDir, 'info.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
