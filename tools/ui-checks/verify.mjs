import { spawn } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const profile = join(here, 'profile2');
const BASE = 'http://localhost:5173';
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let url;
for (let i = 0; i < 40 && !url; i++) {
  try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!url) await sleep(250);
}
const ws = new WebSocket(url);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'ERR ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200); return r.result.value; };
const size = (w, h, mobile) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
const go = async (p, wait = 1800) => { await send('Page.navigate', { url: BASE + p }); await sleep(wait); };
const shot = async (n) => { const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }); writeFileSync(join(here, 'shots', n + '.jpg'), Buffer.from(data, 'base64')); };
const out = {};
await send('Page.enable'); await send('Runtime.enable');

const fold = `(() => { const y=(s)=>{const e=document.querySelector(s); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; const b=(t)=>{const e=[...document.querySelectorAll('button,a')].find(x=>x.textContent.trim()===t); return e?Math.round(e.getBoundingClientRect().top+scrollY):null;}; return { h1:y('h1'), headerEnd:Math.round(document.querySelector('main header')?.getBoundingClientRect().bottom+scrollY), textarea:y('textarea'), analizar:b('Analizar'), resultTitle:y('#result-title'), table:y('table'), firstH2:y('main h2') }; })()`;
for (const [n, w, h, m] of [['d', 1440, 900, false], ['l', 1280, 720, false], ['m', 375, 812, true]]) {
  await size(w, h, m);
  for (const p of ['/analyzer', '/dashboard', '/history', '/settings', '/admin']) { await go(p); out[`fold ${n} ${p}`] = await ev(fold); }
}

// Desplazamiento de la navegación entre páginas
await size(1440, 900, false);
for (const p of ['/dashboard', '/analyzer']) { await go(p); out[`navX ${p}`] = await ev(`[...document.querySelectorAll('nav ul a')].map(a=>a.textContent+':'+Math.round(a.getBoundingClientRect().left))`); }

// Scrollbar en la navegación de administración
await go('/admin');
out.adminNav = await ev(`(() => { const n=document.querySelector('nav[aria-label="Secciones de administración"]'); const s=getComputedStyle(n); return { clientH:n.clientHeight, scrollH:n.scrollHeight, clientW:n.clientWidth, scrollW:n.scrollWidth, overflowY:s.overflowY, offsetMinusClientW:n.offsetWidth-n.clientWidth }; })()`);

// Tablas en móvil: ¿se ve el enlace de detalle?
await size(375, 812, true);
for (const p of ['/history', '/dashboard']) {
  await go(p);
  out[`table m ${p}`] = await ev(`(() => { const t=document.querySelector('table'); const w=t.parentElement; const a=document.querySelector('table a'); const r=a.getBoundingClientRect(); const c=w.getBoundingClientRect(); return { wrapClient:w.clientWidth, wrapScroll:w.scrollWidth, tableW:Math.round(t.getBoundingClientRect().width), linkLeft:Math.round(r.left), linkRight:Math.round(r.right), wrapRight:Math.round(c.right), visible:r.right<=c.right+1, headers:[...t.querySelectorAll('th')].filter(th=>getComputedStyle(th).display!=='none').map(th=>th.textContent) }; })()`);
}

// Tamaño de fuente de los controles en móvil
await go('/login');
out.inputFontM = await ev(`[...document.querySelectorAll('input,textarea')].map(i=>i.id+':'+getComputedStyle(i).fontSize)`);
await go('/analyzer');
out.analyzerInputFontM = await ev(`[...document.querySelectorAll('input,textarea')].map(i=>i.id+':'+getComputedStyle(i).fontSize)`);

// Movimiento reducido: qué queda oculto en la portada
await size(1440, 900, false);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await go('/', 2000);
out.reducedHidden = await ev(`(() => { const res=[]; for(const el of document.querySelectorAll('body *')){ const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim(); if(!t||el.closest('svg')) continue; const s=getComputedStyle(el); const r=el.getBoundingClientRect(); if(s.visibility==='hidden'||s.display==='none'||!r.width) continue; let op=1; for(let n=el;n;n=n.parentElement) op*=parseFloat(getComputedStyle(n).opacity); if(op<0.05) res.push(t.slice(0,32)); } return { count:res.length, sample:res.slice(0,12) }; })()`);
await send('Emulation.setEmulatedMedia', { features: [] });
await go('/', 2000);
out.normalHidden = await ev(`(() => { let c=0; const ex=[]; for(const el of document.querySelectorAll('body *')){ const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim(); if(!t||el.closest('svg')) continue; const s=getComputedStyle(el); const r=el.getBoundingClientRect(); if(s.visibility==='hidden'||s.display==='none'||!r.width) continue; let op=1; for(let n=el;n;n=n.parentElement) op*=parseFloat(getComputedStyle(n).opacity); if(op<0.05){c++; if(ex.length<6) ex.push(t.slice(0,32));} } return {count:c, ex}; })()`);

// Foco tras navegar dentro de la app
await go('/dashboard');
await ev(`[...document.querySelectorAll('nav ul a')].find(a=>a.textContent==='Historial').click(); new Promise(r=>setTimeout(r,800))`);
out.focusAfterRoute = await ev(`({ path:location.pathname, active:document.activeElement.tagName+':'+(document.activeElement.textContent||'').trim().slice(0,20), title:document.title })`);

// Flujo del analizador: ejemplo → enviar → ¿dónde queda el resultado?
await size(1440, 900, false);
await go('/analyzer');
await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,200))`);
out.afterExampleLen = await ev(`document.querySelector('textarea').value.length`);
const yBefore = await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Analizar'); b.scrollIntoView({block:'center'}); return Math.round(scrollY);})()`);
await sleep(300);
await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Analizar').click(); new Promise(r=>setTimeout(r,120))`);
out.analyzeLoadingState = await ev(`document.querySelector('[aria-busy=true]')?.textContent||null`);
await sleep(2500);
out.analyzeFlow = await ev(`(() => { const t=document.querySelector('#result-title').getBoundingClientRect(); const sec=t.top; const panel=[...document.querySelectorAll('section[aria-labelledby=result-title] > *')][1]?.getBoundingClientRect(); return { scrollY:Math.round(scrollY), scrollBefore:${yBefore}, resultTop:Math.round(sec), panelBottom:panel?Math.round(panel.bottom):null, vh:innerHeight, active:document.activeElement.tagName+':'+document.activeElement.textContent.trim().slice(0,20) }; })()`);
await shot('analyzer-after-submit');

// Cambio de pestaña: ¿se pierde lo escrito?
await go('/analyzer');
await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Cargar ejemplo')).click(); new Promise(r=>setTimeout(r,150))`);
await ev(`document.querySelector('#analyzer-tab-url').click(); new Promise(r=>setTimeout(r,250))`);
await ev(`document.querySelector('#analyzer-tab-message').click(); new Promise(r=>setTimeout(r,250))`);
out.tabSwitchKeepsDraft = await ev(`document.querySelector('textarea').value.length`);

// Preferencia de configuración: ¿tiene efecto y persiste?
await go('/settings');
await ev(`document.querySelector('#pref-tips').click(); new Promise(r=>setTimeout(r,100))`);
out.tipsPrefSet = await ev(`document.querySelector('#pref-tips').getAttribute('aria-checked')`);
await go('/settings');
out.tipsPrefAfterReload = await ev(`document.querySelector('#pref-tips').getAttribute('aria-checked')`);

// Menú móvil: ¿el foco puede escapar al contenido oculto?
await size(375, 812, true);
await go('/dashboard');
await ev(`document.querySelector('button[aria-controls=mobile-menu]').click(); new Promise(r=>setTimeout(r,500))`);
out.menuFocusables = await ev(`(() => { const main=document.querySelector('main'); return { firstFocus:document.activeElement.textContent.trim().slice(0,20), mainInert:main.hasAttribute('inert'), mainFocusables:main.querySelectorAll('a,button,input').length, ariaModal:document.querySelector('#mobile-menu').getAttribute('aria-modal') }; })()`);

// Colores: uso de duraciones declaradas
writeFileSync(join(here, 'verify.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
ws.close(); edge.kill(); await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
