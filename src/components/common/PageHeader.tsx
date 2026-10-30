import { useRef, type ReactNode } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { Rule } from './Rule';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}

/**
 * Cabecera de las páginas interiores, con el mismo lenguaje que la home:
 * etiqueta técnica, titular grande en mayúsculas, descripción gris y línea con segmento azul.
 * Entrada breve (≈0,6 s) que nunca bloquea la interacción.
 */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-intro]', { autoAlpha: 0, y: 14, duration: 0.55, stagger: 0.06 })
          .from('[data-intro-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 0.8 }, 0.1);
      });
    },
    { scope },
  );

  return (
    <header ref={scope} className="mb-12 sm:mb-16">
      {eyebrow && (
        <p className="eyebrow" data-intro>
          {eyebrow}
        </p>
      )}
      <h1
        data-intro
        className="mt-6 max-w-5xl font-semiwide text-[2.3rem] font-semibold uppercase leading-[0.98] text-fg text-balance sm:text-[3.4rem] lg:text-[4.2rem]"
      >
        {title}
      </h1>
      {(description || actions) && (
        <div className="mt-6 flex flex-col gap-6 sm:mt-8 lg:flex-row lg:items-end lg:justify-between" data-intro>
          {description && <p className="max-w-xl text-[17px] leading-relaxed text-muted">{description}</p>}
          {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
        </div>
      )}
      <Rule className="mt-10 sm:mt-12" data-intro-rule="" />
    </header>
  );
}
