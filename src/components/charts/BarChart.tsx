import { useState } from 'react';
import type { TimeSeriesPoint } from '@/types/stats';
import { formatNumber } from '@/utils/format';

interface BarChartProps {
  data: TimeSeriesPoint[];
  /** Nombre de la serie para lectores de pantalla y tooltip. */
  seriesLabel: string;
  height?: number;
}

function niceMax(value: number) {
  const pow = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / pow) * pow;
}

/** Barras verticales de una sola serie, con tooltip al pasar el ratón o enfocar. */
export function BarChart({ data, seriesLabel, height = 220 }: BarChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const ticks = [0, max / 2, max];

  return (
    <figure>
      <div className="flex gap-3" style={{ height }}>
        {/* Eje Y */}
        <div className="flex flex-col justify-between pb-6 text-right font-mono text-[10px] text-subtle" aria-hidden>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none">
              {formatNumber(t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Rejilla */}
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between" aria-hidden>
            {ticks.map((t) => (
              <div key={t} className={t === 0 ? 'border-t border-line-strong' : 'border-t border-dashed border-line/70'} />
            ))}
          </div>

          <div className="absolute inset-0 flex items-stretch gap-[2px]">
            {data.map((d, i) => {
              const pct = (d.value / max) * 100;
              const isActive = active === i;
              return (
                <div
                  key={d.label}
                  className="group relative flex flex-1 cursor-default flex-col items-center justify-end outline-none"
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${d.label}: ${formatNumber(d.value)} ${seriesLabel.toLowerCase()}`}
                >
                  <div className="relative flex w-full flex-1 items-end justify-center pb-0">
                    <div
                      className={`w-full max-w-[36px] rounded-t transition-colors ${isActive ? 'bg-accent' : 'bg-accent-strong'}`}
                      style={{ height: `${pct}%` }}
                    />
                    {isActive && (
                      <div className="pointer-events-none absolute z-10 -translate-y-2 whitespace-nowrap rounded-lg border border-line bg-surface-3 px-2.5 py-1.5 text-xs shadow-card" style={{ bottom: `${pct}%` }}>
                        <p className="text-subtle">{d.label}</p>
                        <p className="font-mono font-medium text-fg">{formatNumber(d.value)}</p>
                      </div>
                    )}
                  </div>
                  <span className={`mt-2 h-4 text-[11px] ${isActive ? 'text-fg' : 'text-subtle'}`}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{seriesLabel}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
