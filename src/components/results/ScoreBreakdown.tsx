import type { DetectedSignal, SignalCategory } from '@/types/analysis';
import { SIGNAL_CATEGORY_LABEL } from '@/utils/risk';

/**
 * Barras con la contribución de cada categoría a la puntuación (escala común 0–100).
 * Agrupa por categoría para mostrar Urgencia, Enlaces, Suplantación, Tono… como en el boceto.
 */
export function ScoreBreakdown({ signals }: { signals: DetectedSignal[] }) {
  const totals = new Map<SignalCategory, number>();
  signals.forEach((s) => totals.set(s.category, (totals.get(s.category) ?? 0) + s.weight));
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <ul className="space-y-5">
      {rows.map(([category, weight]) => (
        <li key={category}>
          <div className="flex justify-between text-sm">
            <span className="text-muted">{SIGNAL_CATEGORY_LABEL[category]}</span>
            <span className="font-mono text-fg">+{weight}</span>
          </div>
          <div className="mt-2 h-1.5 bg-surface-3">
            <div className="h-full bg-accent-strong transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, weight)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
