import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const outDir = join(here, 'c1', label);
mkdirSync(outDir, { recursive: true });
const profile = join(here, `profile-c1-${label}`);
const PORT = 9337;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
const SHOTS = [
  ['analyzer-1440', '/analyzer', 1440, 900, false],
  ['analyzer-1280', '/analyzer', 1280, 720, false],
  ['analyzer-375', '/analyzer', 375, 812, true],
  ['dashboard-1440', '/dashboard', 1440, 900, false],
  ['history-1440', '/history', 1440, 900, false],
  ['results-1440', '/results?demo=1', 1440, 900, false],
  ['admin-1440', '/admin', 1440, 900, false],
  ['settings-1440', '/settings', 1440, 900, false],
];
const FOLD = `(() => { const y=(s)=>{const e=document.querySelector(s); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; const b=(t)=>{const e=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim()===t); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; return { headerEnd:Math.round(document.querySelector('main header').getBoundingClientRect().bottom), h1Size:getComputedStyle(document.querySelector('h1')).fontSize, textarea:y('textarea'), analizar:b('Analizar'), table:y('table'), firstH2:y('main h2'), scrollW:document.documentElement.scrollWidth, vw:document.documentElement.clientWidth }; })()`;
const out = {};
for (const [name, path, w, h, mobile] of SHOTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url: 'http://localhost:5173' + path });
  await sleep(2400);
  const r = await send('Runtime.evaluate', { expression: FOLD, returnByValue: true });
  out[name] = r.result.value;
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64'));
}
writeFileSync(join(outDir, 'fold.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
