import { readFileSync } from 'node:fs';
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
let bad = 0;
for (const k of Object.keys(b.results)) {
  const x = a.results[k]; const y = b.results[k];
  const issues = [];
  if (y.scrollW > y.vw) issues.push(`scroll horizontal ${y.scrollW}/${y.vw}`);
  if (y.overflowers.length) issues.push(`desborda: ${y.overflowers.join(',')}`);
  const cy = Object.values(y.contrast);
  if (cy.length) issues.push(`contraste: ${cy.map((c) => `${c.ratio}:1 ${c.size}px '${c.sample}'`).join(' ; ')}`);
  if (y.h1 !== 1) issues.push(`h1=${y.h1}`);
  if (Math.abs(y.pageH - x.pageH) > 120) issues.push(`altura ${x.pageH}->${y.pageH}`);
  const lt12 = (r) => Object.entries(r.sizes).filter(([s]) => +s < 12).reduce((n, [, v]) => n + v, 0);
  const st = `<12px ${lt12(x)}->${lt12(y)}, tactiles ${x.smallTargetCount}->${y.smallTargetCount}`;
  if (issues.length) { bad++; console.log(`[${k}] ${issues.join(' | ')} (${st})`); }
  else console.log(`[${k}] ok (${st})`);
}
console.log('rutas con avisos:', bad, 'errores:', b.errors.length);
console.log('login heads:', b.results['login-d'].heads.join(' > '));
console.log('focusOrder:', b.focusOrder.slice(0, 10).map((s) => s.split(' | ')[0]).join(' > '));
console.log('mobile login small:', b.results['login-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
console.log('mobile history small:', b.results['history-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
console.log('mobile analyzer small:', b.results['analyzer-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
console.log('mobile settings small:', b.results['settings-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
console.log('mobile admin small:', b.results['admin-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
console.log('mobile landing small:', b.results['landing-m'].smallTargets.map((t) => `${t.t}=${t.w}x${t.h}`).join(' | '));
