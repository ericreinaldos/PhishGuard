import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent-strong text-accent-ink hover:bg-accent-deep',
  secondary: 'bg-surface-2 text-fg hover:bg-surface-3 border border-line',
  outline: 'border border-line-strong text-fg hover:border-fg/70 hover:bg-fg/[0.03]',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'border border-danger/40 text-danger hover:bg-danger/10',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-[52px] px-7 text-[15px] gap-2.5',
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth }: StyleProps = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
  );
}

interface ContentProps {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
}

function ButtonContent({ leftIcon: Left, rightIcon: Right, loading, children }: ContentProps) {
  const iconClass = 'h-4 w-4 shrink-0';
  return (
    <>
      {loading ? <Loader2 className={cn(iconClass, 'animate-spin')} aria-hidden /> : Left && <Left className={iconClass} aria-hidden />}
      {children}
      {Right && <Right className={iconClass} aria-hidden />}
    </>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & ContentProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, leftIcon, rightIcon, loading, className, children, type = 'button', disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      {...rest}
    >
      <ButtonContent leftIcon={leftIcon} rightIcon={rightIcon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
});

type ButtonLinkProps = LinkProps & StyleProps & Omit<ContentProps, 'loading'>;

/** Enlace de React Router con apariencia de botón. */
export function ButtonLink({ variant, size, fullWidth, leftIcon, rightIcon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest}>
      <ButtonContent leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}
