import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** Línea divisoria fina con el segmento azul de la home. */
export function Rule({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('relative h-px w-full bg-line', className)} aria-hidden {...rest}>
      <span className="absolute left-0 top-0 h-px w-16 bg-accent-strong sm:w-28" />
    </div>
  );
}
