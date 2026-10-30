import type { RiskLevel } from '@/types/analysis';
import { RISK_CONFIG } from '@/utils/risk';
import { cn } from '@/utils/cn';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
  className?: string;
}

/** Nivel de riesgo con icono + texto: nunca solo color. */
export function RiskBadge({ level, size = 'sm', className }: RiskBadgeProps) {
  const cfg = RISK_CONFIG[level];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border font-medium',
        cfg.text,
        cfg.soft,
        cfg.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      Riesgo {cfg.label.toLowerCase()}
    </span>
  );
}
