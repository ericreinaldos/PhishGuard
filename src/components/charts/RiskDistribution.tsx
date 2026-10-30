import type { RiskDistributionEntry } from '@/types/stats';
import { RISK_CONFIG } from '@/utils/risk';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Barra apilada de niveles de riesgo + leyenda con icono, recuento y porcentaje. */
export function RiskDistribution({ data }: { data: RiskDistributionEntry[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Distribución por nivel de riesgo">
        {data.map((d) => (
          <div
            key={d.level}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', RISK_CONFIG[d.level].solid)}
            style={{ width: `${(d.count / total) * 100}%` }}
            title={`${RISK_CONFIG[d.level].label}: ${formatNumber(d.count)}`}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-3">
        {data.map((d) => {
          const cfg = RISK_CONFIG[d.level];
          const Icon = cfg.icon;
          return (
            <li key={d.level} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted">
                <Icon className={cn('h-4 w-4', cfg.text)} aria-hidden />
                Riesgo {cfg.label.toLowerCase()}
              </span>
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-fg">{formatNumber(d.count)}</span>
                <span className="w-10 text-right font-mono text-xs text-subtle">{Math.round((d.count / total) * 100)} %</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
