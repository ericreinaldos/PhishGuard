import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { AnalysisType } from '@/types/analysis';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';

const MODES: Array<{ type: AnalysisType; label: string; text: string }> = [
  { type: 'message', label: 'Mensaje', text: 'Un correo, un SMS o un chat completo, tal como te ha llegado.' },
  { type: 'url', label: 'URL', text: 'Un enlace suelto. Lo revisamos sin que tengas que abrirlo.' },
  { type: 'headers', label: 'Cabeceras', text: 'La parte técnica del correo, que revela quién lo envió de verdad.' },
];

/** Acceso directo a cada modalidad del analizador. */
export function AnalyzerAccess() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section id="analizar" ref={scope} aria-labelledby="analizar-title" className="scroll-mt-20 border-t border-line py-section">
      <div className="container-page">
        <SectionHeading
          id="analizar-title"
          eyebrow="Analizador"
          title="Empieza por lo que te ha llegado"
          description="Tres puntos de entrada, un mismo criterio de puntuación."
        />

        <ul className="mt-16 border-b border-line" data-reveal="stagger">
          {MODES.map((mode, i) => (
            <li key={mode.type}>
              <Link
                to={mode.type === 'message' ? '/analyzer' : `/analyzer?mode=${mode.type}`}
                className="group relative grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 gap-y-2 overflow-hidden border-t border-line py-8 outline-none sm:grid-cols-[3rem_minmax(0,6fr)_minmax(0,4fr)_auto] sm:gap-x-8 sm:py-10"
              >
                <span
                  className="absolute inset-0 origin-left scale-x-0 bg-accent-strong transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  aria-hidden
                />
                <span className="relative font-mono text-xs text-subtle transition-colors group-hover:text-white/70 group-focus-visible:text-white/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative font-wide text-[1.8rem] font-bold uppercase leading-none tracking-[-0.02em] text-fg transition-colors group-hover:text-white group-focus-visible:text-white sm:text-[2.6rem] lg:text-[3.6rem] xl:text-[4.2rem]">
                  {mode.label}
                </span>
                <span className="relative col-start-2 text-[15px] leading-relaxed text-muted transition-colors group-hover:text-white/85 group-focus-visible:text-white/85 sm:col-start-3 sm:row-start-1">
                  {mode.text}
                </span>
                <ArrowUpRight
                  className="relative col-start-3 row-start-1 h-7 w-7 text-muted transition-[color,transform] duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white group-focus-visible:text-white sm:col-start-4 sm:h-9 sm:w-9"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
