import type { ReactNode } from 'react';
import { formatNumber } from '@/utils/format';

export interface HorizontalBarItem {
  key: string;
  label: ReactNode;
  value: number;
}

/** Barras horizontales de magnitud con etiqueta directa del valor. */
export function HorizontalBars({ items }: { items: HorizontalBarItem[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{item.label}</span>
            <span className="font-mono text-xs text-fg">
              {formatNumber(item.value)} <span className="text-subtle">· {Math.round((item.value / total) * 100)} %</span>
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent-strong" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
