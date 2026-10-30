import type { ReactNode } from 'react';
import { CheckCircle2, Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

type AlertTone = 'info' | 'warning' | 'danger' | 'success';

const TONES: Record<AlertTone, { icon: typeof Info; className: string; iconClass: string }> = {
  info: { icon: Info, className: 'border-info/25 bg-info/5', iconClass: 'text-info' },
  warning: { icon: TriangleAlert, className: 'border-warning/25 bg-warning/5', iconClass: 'text-warning' },
  danger: { icon: OctagonAlert, className: 'border-danger/25 bg-danger/5', iconClass: 'text-danger' },
  success: { icon: CheckCircle2, className: 'border-safe/25 bg-safe/5', iconClass: 'text-safe' },
};

interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Mensaje informativo en línea. */
export function Alert({ tone = 'info', title, children, action, className }: AlertProps) {
  const { icon: Icon, className: toneClass, iconClass } = TONES[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl border p-4', toneClass, className)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-medium text-fg">{title}</p>}
        {children && <div className={cn('text-muted', Boolean(title) && 'mt-1')}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
