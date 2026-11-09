import { useRef, type ReactNode } from 'react';
import { APP_MOTION, gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { cn } from '@/utils/cn';
import { Rule } from './Rule';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}

/**
 * Cabecera de las páginas interiores, con el mismo lenguaje que la home:
 * etiqueta técnica opcional, titular en mayúsculas, descripción gris y línea con segmento azul.
 * Más compacta que la portada para que el trabajo quede cerca del inicio de la página.
 * Su entrada depende de APP_MOTION y nunca bloquea la interacción.
 */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (APP_MOTION === 'subtle') {
          gsap.from('[data-intro], [data-intro-rule]', { autoAlpha: 0, duration: 0.25, ease: 'power1.out' });
          return;
        }
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-intro]', { autoAlpha: 0, y: 14, duration: 0.55, stagger: 0.06 })
          .from('[data-intro-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 0.8 }, 0.1);
      });
    },
    { scope },
  );

  return (
    <header ref={scope} className="mb-8 sm:mb-10">
      {eyebrow && (
        <p className="eyebrow" data-intro>
          {eyebrow}
        </p>
      )}
      <h1
        data-intro
        className={cn('max-w-5xl font-semiwide text-[2rem] font-semibold uppercase leading-[1] text-fg text-balance sm:text-[2.5rem] lg:text-[3rem]', eyebrow && 'mt-4')}
      >
        {title}
      </h1>
      {(description || actions) && (
        <div className="mt-3 flex flex-col gap-4 sm:mt-4 lg:flex-row lg:items-end lg:justify-between" data-intro>
          {description && <p className="max-w-3xl text-base leading-relaxed text-muted">{description}</p>}
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
      )}
      <Rule className="mt-6 sm:mt-8" data-intro-rule="" />
    </header>
  );
}
