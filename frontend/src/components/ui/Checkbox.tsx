import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: ReactNode;
  error?: string;
}

export function Checkbox({ id, label, error, className, ...rest }: CheckboxProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="group inline-flex cursor-pointer items-start gap-2.5 text-sm text-muted">
        <span className="relative mt-0.5 flex h-4 w-4 shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              'peer h-4 w-4 cursor-pointer appearance-none rounded border bg-surface-2 transition checked:border-accent checked:bg-accent',
              error ? 'border-danger/70' : 'border-line-strong group-hover:border-accent/60',
            )}
            {...rest}
          />
          <Check className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-accent-ink opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden />
        </span>
        <span className="leading-snug">{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
