import { useRef } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';

const PRINCIPLES = [
  { title: 'Cada señal tiene nombre', text: 'Verás la regla que la activó y el fragmento exacto de tu mensaje.' },
  { title: 'La suma es visible', text: 'La puntuación es la suma de sus partes. Nada más.' },
  { title: 'Las reglas se revisan', text: 'Se pueden ajustar, versionar y corregir cuando fallan.' },
];

const BREAKDOWN = [
  { id: 'LNK-004', label: 'Enlaces sospechosos', points: 35 },
  { id: 'URG-001', label: 'Urgencia', points: 25 },
  { id: 'IMP-002', label: 'Suplantación', points: 25 },
  { id: 'TON-003', label: 'Tono', points: 5 },
];

export function Transparency() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const total = BREAKDOWN.reduce((sum, r) => sum + r.points, 0);

  return (
    <section id="transparencia" ref={scope} aria-labelledby="transparencia-title" className="scroll-mt-20 border-t border-line py-section">
      <div className="container-page">
        <SectionHeading
          id="transparencia-title"
          eyebrow="Transparencia"
          title={
            <>
              Cada punto tiene <span className="text-accent-strong">una regla</span> detrás
            </>
          }
          description="PhishGuard no te pide que confíes a ciegas. No hay cajas negras: si algo no se puede explicar, no puntúa."
        />

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <ul className="lg:col-span-5" data-reveal="stagger">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="border-t border-line py-7">
                <p className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 font-semiwide text-xl font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:col-span-7" data-reveal>
            <figure className="bg-surface">
              <figcaption className="flex justify-between border-b border-line px-5 py-3 font-mono text-[11px] text-subtle">
                <span>reglas/urgencia.yml</span>
                <span className="uppercase tracking-[0.16em]">ejemplo</span>
              </figcaption>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7" data-lenis-prevent>
                <code>
                  <span className="text-subtle">id:</span> <span className="text-accent">URG-001</span>
                  {'\n'}
                  <span className="text-subtle">nombre:</span> <span className="text-fg">Urgencia artificial</span>
                  {'\n'}
                  <span className="text-subtle">si_contiene:</span>
                  {'\n'}
                  {'  '}- <span className="text-warning">"24 horas"</span>
                  {'\n'}
                  {'  '}- <span className="text-warning">"inmediatamente"</span>
                  {'\n'}
                  {'  '}- <span className="text-warning">"último aviso"</span>
                  {'\n'}
                  <span className="text-subtle">peso:</span> <span className="text-fg">25</span>
                </code>
              </pre>
            </figure>

            <div className="bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Cómo se obtiene un {total}</p>
              <table className="mt-4 w-full text-sm">
                <caption className="sr-only">Desglose de una puntuación de ejemplo</caption>
                <tbody>
                  {BREAKDOWN.map((r) => (
                    <tr key={r.id} className="border-b border-line">
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-subtle">{r.id}</td>
                      <td className="py-2.5 text-muted">{r.label}</td>
                      <td className="py-2.5 text-right font-mono text-fg">+{r.points}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td />
                    <td className="pt-4 font-medium text-fg">Total</td>
                    <td className="pt-4 text-right font-wide text-2xl font-bold text-danger">{total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
