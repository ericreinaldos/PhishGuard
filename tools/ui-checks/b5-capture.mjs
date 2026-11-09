import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const outDir = join(here, 'b5', label);
mkdirSync(outDir, { recursive: true });
const profile = join(here, `profile-b5-${label}`);
const PORT = 9342;
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
const PAGES = [['dashboard', '/dashboard'], ['results', '/results?demo=1']];
const INFO = `(() => { const h=[...document.querySelectorAll('main h2')].filter(e=>e.getBoundingClientRect().height>0).map(e=>e.textContent.trim().slice(0,30)+'@'+Math.round(e.getBoundingClientRect().top+scrollY)); const stat=[...document.querySelectorAll('p.label')].find(e=>/realizados/i.test(e.textContent)); const alto=[...document.querySelectorAll('p')].find(e=>/^\\s*(alto)\\s*$/i.test(e.textContent)); return { h2:h, statsY:stat?Math.round(stat.getBoundingClientRect().top+scrollY):null, altoY:alto?Math.round(alto.getBoundingClientRect().top+scrollY):null, pageH:document.documentElement.scrollHeight, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, vh:innerHeight }; })()`;
const out = {};
for (const [vn, w, h, scale, mobile] of VIEW) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile });
  for (const [pn, path] of PAGES) {
    await send('Page.navigate', { url: 'http://localhost:5173' + path });
    await sleep(2200);
    // Recorre la página para completar el revelado del veredicto
    await ev(`(async()=>{const H=document.documentElement.scrollHeight; for(let y=0;y<H;y+=innerHeight){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150));} window.scrollTo(0,0); await new Promise(r=>setTimeout(r,1200));})()`);
    out[`${pn}-${vn}`] = await ev(INFO);
    const a = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    writeFileSync(join(outDir, `${pn}-${vn}.png`), Buffer.from(a.data, 'base64'));
    const H = out[`${pn}-${vn}`].pageH;
    const b = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: H, scale: 1 / scale } });
    writeFileSync(join(outDir, `${pn}-${vn}-full.png`), Buffer.from(b.data, 'base64'));
  }
}
writeFileSync(join(outDir, 'info.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
