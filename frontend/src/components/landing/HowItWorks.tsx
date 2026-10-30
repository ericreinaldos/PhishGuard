import { useRef, useState } from 'react';
import { HOW_STEPS } from '@/data/content';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/utils/cn';
import { FrameShell, HowFrame } from './HowFrames';

/**
 * «¿Cómo funcionamos?» — estructura del diseño de Figma (cuatro pasos numerados).
 * Escritorio: los pasos avanzan a la izquierda y la ilustración fija de la derecha cambia con el paso activo.
 * Móvil: cada paso lleva su propia ilustración debajo.
 */
export function HowItWorks() {
  const scope = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useReveal(scope);

  useGSAP(
    () => {
      // Paso activo según la posición de scroll (no es movimiento: funciona también con movimiento reducido)
      scope.current?.querySelectorAll<HTMLElement>('[data-step]').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        gsap.fromTo(
          '[data-progress]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top center',
            scrollTrigger: { trigger: '[data-steps]', start: 'top 55%', end: 'bottom 55%', scrub: true },
          },
        );
      });
    },
    { scope },
  );

  return (
    <section id="como-funciona" ref={scope} aria-labelledby="como-funciona-title" className="scroll-mt-20 border-t border-line bg-surface/40 py-section">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow" data-reveal>
              Cómo funciona
            </p>
            <h2
              id="como-funciona-title"
              data-reveal
              className="mt-6 font-semiwide text-[2.3rem] font-semibold uppercase leading-[0.98] text-fg sm:text-[3.6rem] lg:text-[4.6rem]"
            >
              ¿Cómo <span className="text-accent-strong">funcionamos</span>?
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[17px] leading-relaxed text-muted">
            Cuatro pasos, siempre los mismos. El motor de reglas está en desarrollo: las ilustraciones muestran cómo se verá el proceso.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-16 lg:mt-28 lg:grid-cols-12 lg:gap-10">
          {/* Pasos */}
          <ol data-steps className="relative lg:col-span-5">
            <span className="absolute bottom-0 left-[1.4rem] top-0 hidden w-px bg-line lg:block" aria-hidden>
              <span data-progress className="absolute inset-0 origin-top bg-accent-strong" />
            </span>

            {HOW_STEPS.map((step, i) => {
              const isActive = active === i;
              return (
                <li key={step.title} data-step className="relative pb-16 last:pb-0 lg:flex lg:min-h-[68vh] lg:items-center lg:pb-0">
                  <div className="flex gap-6 sm:gap-8">
                    <span
                      className={cn(
                        'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-semiwide text-lg font-semibold transition-colors duration-300',
                        isActive ? 'border-fg bg-fg text-bg' : 'border-line-strong bg-bg text-muted lg:bg-surface',
                      )}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Paso {String(i + 1).padStart(2, '0')}</p>
                      <h3
                        className={cn(
                          'mt-3 font-semiwide text-[1.9rem] font-semibold leading-[1.05] transition-colors duration-300 sm:text-[2.4rem]',
                          isActive ? 'text-fg' : 'text-fg lg:text-fg/40',
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-4 text-[17px] font-medium text-fg/90">{step.summary}</p>
                      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{step.text}</p>
                    </div>
                  </div>

                  {/* Ilustración a todo el ancho, solo en móvil y tablet */}
                  <FrameShell step={i} total={HOW_STEPS.length} className="mt-8 lg:hidden">
                    <HowFrame step={i} />
                  </FrameShell>
                </li>
              );
            })}
          </ol>

          {/* Ilustración fija (escritorio) */}
          <div className="hidden lg:col-span-7 lg:block" aria-hidden>
            <div className="sticky top-[calc(50vh-15rem)]">
              <FrameShell step={active} total={HOW_STEPS.length} className="h-[30rem]">
                {HOW_STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    className={cn(
                      'absolute inset-0 p-7 transition-[opacity,transform] duration-500 ease-out',
                      active === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
                    )}
                  >
                    <HowFrame step={i} active={active === i} />
                  </div>
                ))}
              </FrameShell>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
