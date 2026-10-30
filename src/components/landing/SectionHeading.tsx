import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
}

/** Encabezado de sección de la landing: titular en mayúsculas, ancho y con mucho aire. */
export function SectionHeading({ eyebrow, title, description, id, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <p className="eyebrow" data-reveal>
        {eyebrow}
      </p>
      <h2
        id={id}
        data-reveal
        className="mt-6 font-semiwide text-[2.1rem] font-semibold uppercase leading-[1] text-fg text-balance sm:text-[3rem] lg:text-[3.6rem]"
      >
        {title}
      </h2>
      {description && (
        <p data-reveal className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
