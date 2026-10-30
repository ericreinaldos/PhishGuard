import { RISK_CONFIG, RISK_LEVELS, RISK_THRESHOLDS, scoreToLevel } from '@/utils/risk';
import { cn } from '@/utils/cn';

const BOUNDS = { low: [0, RISK_THRESHOLDS.medium], medium: [RISK_THRESHOLDS.medium, RISK_THRESHOLDS.high], high: [RISK_THRESHOLDS.high, 100] } as const;

/** Escala 0–100 dividida en tramos de riesgo, con un marcador en la puntuación. */
export function RiskScale({ score, className }: { score: number; className?: string }) {
  const value = Math.max(0, Math.min(100, score));
  const level = scoreToLevel(value);

  return (
    <div className={className}>
      <div className="relative pt-7">
        <div
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-fg"
          style={{ left: `${value}%` }}
          aria-hidden
        >
          {value}
        </div>
        <div className="flex h-2 gap-[2px]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={`Puntuación ${value} de 100, riesgo ${RISK_CONFIG[level].label.toLowerCase()}`}>
          {RISK_LEVELS.map((l) => {
            const [from, to] = BOUNDS[l];
            return <div key={l} className={cn('h-full', RISK_CONFIG[l].solid, l === level ? 'opacity-100' : 'opacity-25')} style={{ width: `${to - from}%` }} />;
          })}
        </div>
        <span className="absolute top-5 h-6 w-0.5 -translate-x-1/2 bg-fg" style={{ left: `${value}%` }} aria-hidden />
      </div>
      <div className="mt-3 flex font-mono text-[11px] text-subtle" aria-hidden>
        {RISK_LEVELS.map((l) => {
          const [from, to] = BOUNDS[l];
          return (
            <span key={l} style={{ width: `${to - from}%` }} className={l === level ? RISK_CONFIG[l].text : undefined}>
              {RISK_CONFIG[l].label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
