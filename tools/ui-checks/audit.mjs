import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, 'shots');
const profile = join(here, 'profile');
mkdirSync(shots, { recursive: true });

const BASE = 'http://localhost:5173';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const ROUTES = [
  ['landing', '/'],
  ['login', '/login'],
  ['register', '/register'],
  ['dashboard', '/dashboard'],
  ['analyzer', '/analyzer'],
  ['results-demo', '/results?demo=1'],
  ['results-empty', '/results'],
  ['history', '/history'],
  ['settings', '/settings'],
  ['admin', '/admin'],
  ['notfound', '/no-existe'],
];
const VIEWPORTS = [
  ['d', 1440, 900, false],
  ['t', 768, 1024, true],
  ['m', 375, 812, true],
];
const MAX_SLICES = { d: 10, t: 0, m: 8 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no debug target');
}

const ws = new WebSocket(await target());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
};

const AUDIT = `(() => {
  const parse = (c) => { const m = c.match(/[\\d.]+/g); if (!m) return null; const [r,g,b,a=1] = m.map(Number); return {r,g,b,a}; };
  const lum = ({r,g,b}) => { const f = (v) => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const over = (fg,bg) => ({ r: fg.r*fg.a+bg.r*(1-fg.a), g: fg.g*fg.a+bg.g*(1-fg.a), b: fg.b*fg.a+bg.b*(1-fg.a), a:1 });
  const bgOf = (el) => { const stack=[]; for (let n=el;n;n=n.parentElement){ const c=parse(getComputedStyle(n).backgroundColor); if(c&&c.a>0){ stack.push(c); if(c.a===1) break; } } let base={r:18,g:18,b:18,a:1}; for (const c of stack.reverse()) base=over(c,base); return base; };
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
  const visible = (el) => { const s=getComputedStyle(el); const r=el.getBoundingClientRect(); return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0; };
  const ownText = (el) => [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
  const vw = document.documentElement.clientWidth;
  const sizes={}, contrast={}, overflowers=[]; let upper=0, mono=0, textCount=0, hiddenByOpacity=0;
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const r=el.getBoundingClientRect();
    if (r.right>vw+1 && overflowers.length<8) { let clipped=false; for(let n=el.parentElement;n;n=n.parentElement){ const o=getComputedStyle(n).overflowX; if(o!=='visible'){clipped=true;break;} } if(!clipped) overflowers.push(el.tagName.toLowerCase()+'.'+String(el.className).slice(0,50)); }
    const t=ownText(el); if(!t) continue; if (el.closest('.sr-only')||el.closest('svg')) continue;
    const s=getComputedStyle(el);
    let op=1; for(let n=el;n;n=n.parentElement){ op*=parseFloat(getComputedStyle(n).opacity); }
    if (op<0.05) { hiddenByOpacity++; continue; }
    textCount++;
    const fs=parseFloat(s.fontSize); const key=Math.round(fs*10)/10; sizes[key]=(sizes[key]||0)+1;
    if(s.textTransform==='uppercase') upper++;
    if(s.fontFamily.includes('Mono')) mono++;
    if (s.webkitTextStrokeWidth!=='0px' || parseFloat(s.fontSize)>=60) continue;
    const c=parse(s.color); if(!c) continue;
    const bg=bgOf(el); const cr=ratio(over(c,bg),bg);
    const large=fs>=24||(fs>=18.66&&parseInt(s.fontWeight)>=700);
    if(cr<(large?3:4.5)){ const k=s.color+'|'+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b); (contrast[k] ||= {ratio:Math.round(cr*100)/100,size:fs,count:0,sample:t.slice(0,50)}).count++; }
  }
  const targets=[]; for (const el of document.querySelectorAll('a,button,input:not([type=hidden]),textarea,select,[role=tab],[role=switch]')) {
    if(!visible(el)) continue; const r=el.getBoundingClientRect(); if(r.height<44||r.width<24){ targets.push({t:(el.getAttribute('aria-label')||el.textContent||el.placeholder||el.tagName).trim().slice(0,34),w:Math.round(r.width),h:Math.round(r.height)}); }
  }
  const seen=new Set(); const small=targets.filter(x=>{const k=x.t+x.w+x.h; if(seen.has(k))return false; seen.add(k); return true;});
  const heads=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(h=>h.tagName[1]+':'+h.textContent.trim().slice(0,28));
  const radii={}; for(const el of document.querySelectorAll('button,a,input,textarea,div,span')){ if(!visible(el)) continue; const s=getComputedStyle(el); const b=s.borderTopLeftRadius; if(b!=='0px'&&(s.borderTopWidth!=='0px'||s.backgroundColor!=='rgba(0, 0, 0, 0)')) radii[b]=(radii[b]||0)+1; }
  return { url:location.pathname+location.search, title:document.title, scrollW:document.documentElement.scrollWidth, vw, pageH:document.documentElement.scrollHeight, overflowers, sizes, contrast, smallTargets:small.slice(0,40), smallTargetCount:small.length, heads, textCount, upper, mono, hiddenByOpacity, radii, h1:document.querySelectorAll('h1').length };
})()`;

const SCROLL_THROUGH = `(async () => { const h=()=>document.documentElement.scrollHeight; for(let y=0;y<h();y+=Math.round(innerHeight*0.6)){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,220)); } await new Promise(r=>setTimeout(r,500)); window.scrollTo(0,0); await new Promise(r=>setTimeout(r,500)); return h(); })()`;

await send('Page.enable');
await send('Runtime.enable');
const results = {};
const errors = [];

for (const [vName, w, h, mobile] of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  for (const [name, path] of ROUTES) {
    const id = `${name}-${vName}`;
    try {
      await send('Page.navigate', { url: BASE + path });
      await sleep(2200);
      const pageH = await evaluate(SCROLL_THROUGH);
      results[id] = await evaluate(AUDIT);
      const slices = Math.min(MAX_SLICES[vName], Math.ceil(pageH / h));
      for (let i = 0; i < Math.max(slices, vName === 't' ? 1 : 0); i++) {
        await evaluate(`window.scrollTo(0,${i * h}); new Promise(r=>setTimeout(r,650))`);
        const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
        writeFileSync(join(shots, `${id}-${i}.jpg`), Buffer.from(data, 'base64'));
      }
    } catch (e) { errors.push(`${id}: ${e.message}`); }
  }
}

// Movimiento reducido: ¿queda contenido oculto en la portada y en las páginas interiores?
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
const reduced = {};
for (const [name, path] of [['landing', '/'], ['dashboard', '/dashboard']]) {
  await send('Page.navigate', { url: BASE + path });
  await sleep(2000);
  reduced[name] = await evaluate(`(() => { const r=${AUDIT}; return { hiddenByOpacity:r.hiddenByOpacity, textCount:r.textCount, pageH:r.pageH, lenis:document.documentElement.classList.contains('lenis') }; })()`);
}
await send('Emulation.setEmulatedMedia', { features: [] });

// Navegación con teclado en /login: orden real de foco
await send('Page.navigate', { url: BASE + '/login' });
await sleep(1500);
const focusOrder = [];
for (let i = 0; i < 12; i++) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  focusOrder.push(await evaluate(`(() => { const e=document.activeElement; const s=getComputedStyle(e); return (e.getAttribute('aria-label')||e.textContent||e.id||e.tagName).trim().slice(0,30)+' | outline '+s.outlineStyle+' '+s.outlineWidth+' | ring '+(s.boxShadow!=='none'); })()`));
}

// Envío vacío del login: ¿el foco va al primer error?
await send('Page.navigate', { url: BASE + '/login' });
await sleep(1500);
const loginError = await evaluate(`(async () => { document.querySelector('button[type=submit]').click(); await new Promise(r=>setTimeout(r,400)); const e=document.activeElement; return { active:e.id||e.tagName, invalid:[...document.querySelectorAll('[aria-invalid=true]')].map(i=>i.id), roleAlert:document.querySelectorAll('[role=alert]').length, ariaLive:[...document.querySelectorAll('[aria-live]')].length }; })()`);
const { data: errShot } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
writeFileSync(join(shots, 'login-errors.jpg'), Buffer.from(errShot, 'base64'));

// Menú móvil abierto
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: BASE + '/dashboard' });
await sleep(1500);
await evaluate(`document.querySelector('button[aria-controls=mobile-menu]').click(); new Promise(r=>setTimeout(r,700))`);
const { data: menuShot } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
writeFileSync(join(shots, 'app-menu-m.jpg'), Buffer.from(menuShot, 'base64'));

writeFileSync(join(here, 'results.json'), JSON.stringify({ results, reduced, focusOrder, loginError, errors }, null, 1));
ws.close();
edge.kill();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log('routes', Object.keys(results).length, 'errors', errors.length);
errors.forEach((e) => console.log(e));
process.exit(0);
