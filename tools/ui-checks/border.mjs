import { spawn } from 'node:child_process';
const PORT = 9335;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.argv[3]}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(250); }
const ws = new WebSocket(url); await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable');
await send('Page.navigate', { url: process.argv[2] + '/login' });
await sleep(2000);
const r = await send('Runtime.evaluate', { returnByValue: true, expression: `(() => { const s=(q)=>getComputedStyle(document.querySelector(q)); return { email:s('#email').borderTopColor, checkbox:s('#remember').borderTopColor, fontSize:s('#email').fontSize, button:s('button[type=submit]').transitionDuration, buttonProps:s('button[type=submit]').transitionProperty }; })()` });
console.log(JSON.stringify(r.result.value));
ws.close(); edge.kill(); process.exit(0);
