import { RISK_CONFIG, scoreToLevel } from '@/utils/risk';
import { cn } from '@/utils/cn';

interface ScoreBarProps {
  score: number;
  /** Muestra el número a la derecha de la barra. */
  showValue?: boolean;
  className?: string;
}

/** Barra compacta de puntuación para tablas y listados. */
export function ScoreBar({ score, showValue = true, className }: ScoreBarProps) {
  const level = scoreToLevel(score);
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Puntuación de riesgo"
      >
        <div className={cn('h-full rounded-full', RISK_CONFIG[level].solid)} style={{ width: `${score}%` }} />
      </div>
      {showValue && <span className="w-7 text-right font-mono text-xs tabular-nums text-fg">{score}</span>}
    </div>
  );
}
