import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Etiqueta técnica de la barra superior (mayúsculas, monoespaciada). */
  label?: ReactNode;
  /** Contenido alineado a la derecha de la barra superior. */
  aside?: ReactNode;
  padding?: 'none' | 'md' | 'lg';
}

/**
 * Superficie con barra de cabecera, la misma que el correo de ejemplo del hero.
 * Es el único «contenedor» de la app: se usa para formularios, gráficos e ilustraciones.
 */
export function Panel({ label, aside, padding = 'md', className, children, ...rest }: PanelProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-line bg-surface', className)} {...rest}>
      {(label || aside) && (
        <div className="flex min-h-[44px] items-center justify-between gap-4 border-b border-line px-5 py-2.5 sm:px-6">
          {label && <div className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{label}</div>}
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      )}
      <div className={cn('relative flex-1', padding === 'md' && 'p-5 sm:p-6', padding === 'lg' && 'p-5 sm:p-8')}>{children}</div>
    </div>
  );
}
