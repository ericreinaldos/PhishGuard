// Pasada final: todas las rutas en los cuatro viewports, con errores de consola y de red.
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const label = process.argv[2];
const BASE = process.argv[3];
const PORT = label === 'dev' ? 9347 : 9348;
const profile = join(here, `profile-final-${label}`);
const src = readFileSync(join(here, 'audit.mjs'), 'utf8');
const AUDIT = src.slice(src.indexOf('const AUDIT = `') + 'const AUDIT = `'.length, src.indexOf('})()`;', src.indexOf('const AUDIT = `')) + 4).replace(/\\\\/g, '\\');
const ROUTES = [['landing', '/'], ['login', '/login'], ['register', '/register'], ['dashboard', '/dashboard'], ['analyzer', '/analyzer'], ['analyzer-url', '/analyzer?mode=url'], ['analyzer-headers', '/analyzer?mode=headers'], ['results-demo', '/results?demo=1'], ['results-empty', '/results'], ['results-id', '/results?id=demo-1'], ['history', '/history'], ['settings', '/settings'], ['admin', '/admin'], ['notfound', '/no-existe']];
const VIEW = [['1440x900', 1440, 900, 1, false], ['1366x768', 1366, 768, 1, false], ['1536x730', 1536, 730, 1.25, false], ['375x812', 375, 812, 2, true]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map(); let current = 'inicio';
const problems = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') problems.push(`${current} EXCEPCIÓN ${(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 180)}`);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push(`${current} CONSOLA[${m.params.type}] ${m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 180)}`);
  if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level)) problems.push(`${current} LOG[${m.params.entry.level}] ${m.params.entry.text.slice(0, 120)} ${(m.params.entry.url || '').slice(0, 90)}`);
};
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; const timer = setTimeout(() => { pending.delete(id); rej(new Error(`tiempo agotado en ${method} (${current})`)); }, 30000); pending.set(id, (m) => { clearTimeout(timer); m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result); }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; };
const SCROLL = `(async () => { const h=()=>document.documentElement.scrollHeight; for(let y=0;y<h();y+=Math.round(innerHeight*0.7)){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,140)); } await new Promise(r=>setTimeout(r,300)); window.scrollTo(0,0); await new Promise(r=>setTimeout(r,250)); })()`;
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
const rows = []; const issues = [];
for (const [vn, w, h, s, m] of VIEW) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: s, mobile: m });
  for (const [name, path] of ROUTES) {
    current = `${name}@${vn}`;
    console.log(`${new Date().toLocaleTimeString()} ${current}`);
    let r;
    try {
      await send('Page.navigate', { url: BASE + path });
      await sleep(1700);
      await ev(SCROLL);
      r = await ev(AUDIT);
    } catch (e) {
      issues.push(`${current}: FALLO DE MEDICIÓN ${e.message}`);
      console.log(`  FALLO ${e.message}`);
      continue;
    }
    const bad = [];
    if (r.scrollW > r.vw) bad.push(`scroll horizontal ${r.scrollW}/${r.vw}`);
    if (r.overflowers.length) bad.push(`desborda ${r.overflowers.join(',')}`);
    const cs = Object.values(r.contrast); if (cs.length) bad.push(`contraste ${cs.map((c) => `${c.ratio}:1 ${c.size}px '${c.sample}'`).join(';')}`);
    if (r.h1 !== 1) bad.push(`h1=${r.h1}`);
    const small = r.smallTargets.filter((t) => t.h < 24 && !/Saltar/.test(t.t)).map((t) => `${t.t}=${t.w}x${t.h}`);
    rows.push({ id: current, h: r.pageH, under24: small });
    if (bad.length) issues.push(`${current}: ${bad.join(' | ')}`);
  }
}
writeFileSync(join(here, `final-${label}.json`), JSON.stringify({ rows, issues, problems }, null, 1));
console.log(`[${label}] combinaciones: ${rows.length}; incidencias de diseño: ${issues.length}; errores/avisos de consola y red: ${problems.length}`);
issues.forEach((i) => console.log('  ' + i));
[...new Set(problems.map((p) => p.replace(/^\S+ /, '')))].slice(0, 15).forEach((p) => console.log('  ' + p));
const u = {}; rows.forEach((r) => r.under24.forEach((t) => { (u[t] ||= []).push(r.id); }));
console.log('  zonas táctiles <24 px:', Object.keys(u).join(' | ') || 'ninguna');
ws.close(); edge.kill(); await sleep(400);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
