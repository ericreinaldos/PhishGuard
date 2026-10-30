import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'warning' | 'danger' | 'safe';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-3 text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  info: 'border-info/30 bg-info/10 text-info',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  safe: 'border-safe/30 bg-safe/10 text-safe',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium', TONES[tone], className)}
      {...rest}
    />
  );
}
