import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Contenido alineado a la derecha de la etiqueta (p. ej. "¿Olvidaste tu contraseña?"). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Envoltorio común para etiqueta, ayuda y error de cualquier control de formulario. */
export function Field({ id, label, hint, error, aside, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex min-h-[20px] items-center justify-between gap-2">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Ids para aria-describedby según haya error o ayuda. */
export const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export const controlBase =
  'w-full rounded-lg border bg-bg/60 text-[15px] text-fg placeholder:text-subtle transition-colors focus:outline-none focus:ring-4 focus:ring-accent-strong/20 disabled:opacity-60';

export const controlBorder = (invalid?: boolean) =>
  invalid ? 'border-danger/70 focus:border-danger' : 'border-line-strong/70 hover:border-line-strong focus:border-accent';
