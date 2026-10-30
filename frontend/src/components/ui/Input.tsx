import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Field, controlBase, controlBorder, describedBy } from './Field';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  icon?: LucideIcon;
  aside?: ReactNode;
  /** Elemento al final del campo (botón, indicador…). */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, icon: Icon, aside, trailing, className, ...rest },
  ref,
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} aside={aside}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlBase, controlBorder(Boolean(error)), 'h-12', Icon ? 'pl-10' : 'pl-3.5', trailing ? 'pr-11' : 'pr-3.5', className)}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
    </Field>
  );
});

type PasswordInputProps = Omit<InputProps, 'type' | 'trailing'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <Input
      ref={ref}
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-md p-2 text-subtle transition hover:text-fg"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          <Icon className="h-4 w-4" />
        </button>
      }
    />
  );
});
