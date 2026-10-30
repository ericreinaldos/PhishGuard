import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Field, controlBase, controlBorder, describedBy } from './Field';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  aside?: ReactNode;
  /** Muestra "n / max" bajo el campo. */
  showCount?: boolean;
  mono?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, aside, showCount, mono, maxLength, value, className, ...rest },
  ref,
) {
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <Field id={id} label={label} hint={hint} error={error} aside={aside}>
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(
            controlBase,
            controlBorder(Boolean(error)),
            'block resize-y px-4 py-3 leading-relaxed',
            mono && 'font-mono text-[13px]',
            showCount && 'pb-8',
            className,
          )}
          {...rest}
        />
        {showCount && (
          <span className="pointer-events-none absolute bottom-2.5 right-3 font-mono text-[11px] text-subtle" aria-live="polite">
            {length.toLocaleString('es-ES')}
            {maxLength ? ` / ${maxLength.toLocaleString('es-ES')}` : ''} caracteres
          </span>
        )}
      </div>
    </Field>
  );
});
