import { RISK_CONFIG, RISK_THRESHOLDS, scoreToLevel } from '@/utils/risk';
import { cn } from '@/utils/cn';

interface ScoreGaugeProps {
  /** Puntuación 0–100. `null` muestra el medidor vacío. */
  score: number | null;
  size?: number;
  className?: string;
}

const START = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

/** Medidor semicircular 0–100 con marcas en los umbrales de riesgo. */
export function ScoreGauge({ score, size = 200, className }: ScoreGaugeProps) {
  const c = 100;
  const r = 80;
  const value = score === null ? 0 : Math.max(0, Math.min(100, score));
  const level = score === null ? null : scoreToLevel(value);
  const end = START + (SWEEP * value) / 100;
  const ticks = [RISK_THRESHOLDS.medium, RISK_THRESHOLDS.high];

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size * 0.82 }}>
      <svg viewBox="0 0 200 170" className="h-full w-full" role="img" aria-label={score === null ? 'Sin puntuación' : `Puntuación de riesgo ${value} sobre 100`}>
        <path d={arcPath(c, c, r, START, START + SWEEP)} fill="none" stroke="rgb(var(--surface-3))" strokeWidth="12" strokeLinecap="round" />
        {level && value > 0 && (
          <path
            d={arcPath(c, c, r, START, end)}
            fill="none"
            stroke={RISK_CONFIG[level].cssColor}
            strokeWidth="12"
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        {ticks.map((t) => {
          const angle = START + (SWEEP * t) / 100;
          const inner = polar(c, c, r - 12, angle);
          const outer = polar(c, c, r + 12, angle);
          return <line key={t} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgb(var(--bg))" strokeWidth="3" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className={cn('font-wide text-5xl font-bold tabular-nums', level ? RISK_CONFIG[level].text : 'text-subtle')}>
          {score === null ? '—' : value}
        </span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-widest text-subtle">de 100</span>
      </div>
    </div>
  );
}
