import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const only = process.argv[3]; // filtro opcional de nombres
const outDir = join(here, 'b3', label);
mkdirSync(outDir, { recursive: true });
const profile = join(here, `profile-b3-${label}`);
const PORT = 9338;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable'); await send('Runtime.enable');

// [nombre, ancho, alto, escala, móvil]. 1536×730 = 1920×1080 al 125 % descontando la interfaz del navegador
const VIEWPORTS = [['1440x900', 1440, 900, 1, false], ['1366x768', 1366, 768, 1, false], ['1536x730', 1536, 730, 1.25, false], ['375x812', 375, 812, 2, true]];
const PAGES = [['analyzer', '/analyzer'], ['dashboard', '/dashboard'], ['history', '/history'], ['results', '/results?demo=1'], ['admin', '/admin'], ['settings', '/settings']];
const FOLD = `(() => { const y=(s)=>{const e=document.querySelector(s); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; const b=(t)=>{const e=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim()===t); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; const h=document.querySelector('main header'); return { headerEnd:h?Math.round(h.getBoundingClientRect().bottom+scrollY):null, h1:getComputedStyle(document.querySelector('h1')).fontSize, textarea:y('textarea'), analizar:b('Analizar'), table:y('table'), firstH2:y('main h2'), overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, vh:innerHeight, vw:innerWidth }; })()`;
const out = {};
for (const [vn, w, h, scale, mobile] of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile });
  for (const [pn, path] of PAGES) {
    const name = `${pn}-${vn}`;
    if (only && !only.split(',').some((f) => name.includes(f))) continue;
    await send('Page.navigate', { url: 'http://localhost:5173' + path });
    await sleep(2300);
    const r = await send('Runtime.evaluate', { expression: FOLD, returnByValue: true });
    out[name] = r.result.value;
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64'));
  }
}
writeFileSync(join(outDir, 'fold.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
