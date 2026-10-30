import { useRef, type ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/utils/cn';

interface SectionProps {
  /** Número de sección (01, 02…) como en la home. */
  index?: number;
  title: ReactNode;
  description?: ReactNode;
  /** Acción alineada con el título (enlace, botón…). */
  action?: ReactNode;
  children: ReactNode;
  /**
   * `side`: etiqueta en una columna a la izquierda y contenido a la derecha (informes, ajustes).
   * `stacked`: título encima y contenido a todo el ancho (tablas, paneles densos).
   */
  layout?: 'side' | 'stacked';
  id?: string;
  className?: string;
}

/** Bloque editorial separado por una línea fina, reutilizado en todas las páginas interiores. */
export function Section({ index, title, description, action, children, layout = 'side', id, className }: SectionProps) {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  const headingId = id ? `${id}-title` : undefined;

  const heading = (
    <div className="min-w-0">
      {index !== undefined && <p className="font-mono text-xs text-subtle">{String(index).padStart(2, '0')}</p>}
      <h2 id={headingId} className={cn('font-semiwide text-[1.4rem] font-semibold leading-tight text-fg sm:text-2xl', index !== undefined && 'mt-3')}>
        {title}
      </h2>
      {description && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>}
    </div>
  );

  return (
    <section ref={scope} id={id} aria-labelledby={headingId} className={cn('scroll-mt-24 border-t border-line py-10 sm:py-14', className)}>
      {layout === 'side' ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4 xl:col-span-3" data-reveal>
            {heading}
            {action && <div className="mt-5">{action}</div>}
          </div>
          <div className="min-w-0 lg:col-span-8 xl:col-span-9" data-reveal data-reveal-delay="0.05">
            {children}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
            {heading}
            {action}
          </div>
          <div data-reveal data-reveal-delay="0.05">
            {children}
          </div>
        </>
      )}
    </section>
  );
}
