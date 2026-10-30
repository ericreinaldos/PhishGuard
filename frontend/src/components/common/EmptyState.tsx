import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Estado vacío editorial: línea superior, titular y una acción clara. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-start gap-6 border-y border-line py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16', className)}>
      <div className="flex gap-5">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="font-semiwide text-xl font-semibold text-fg sm:text-2xl">{title}</h3>
          {description && <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-10 sm:pl-0">{action}</div>}
    </div>
  );
}
