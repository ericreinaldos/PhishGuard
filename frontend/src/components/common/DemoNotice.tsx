import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Etiqueta breve que marca un bloque como datos de demostración. */
export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border border-warning/40 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-warning',
        className,
      )}
      title="Datos ficticios de demostración"
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      Demo
    </span>
  );
}

/** Aviso de página: lo que se ve son datos ficticios, no actividad real. */
export function DemoNotice({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-4 rounded-lg border border-warning/30 px-4 py-3.5 text-sm sm:items-center', className)}>
      <DemoTag className="shrink-0" />
      <p className="text-muted">
        <span className="text-fg">Datos de demostración.</span>{' '}
        {children ?? 'Las cifras y registros de esta página son ficticios y sirven solo para mostrar el diseño.'}
      </p>
    </div>
  );
}
