import { ShieldCheck } from 'lucide-react';
import type { DetectedSignal } from '@/types/analysis';
import { EmptyState } from '@/components/common/EmptyState';
import { SIGNAL_CATEGORY_LABEL } from '@/utils/risk';

/**
 * Señales detectadas, numeradas en el orden recibido, con la regla, el motivo y la evidencia.
 * El número coincide con el que aparece en el mensaje subrayado.
 */
export function SignalList({ signals }: { signals: DetectedSignal[] }) {
  if (signals.length === 0) {
    return <EmptyState icon={ShieldCheck} title="Sin señales detectadas" description="Ninguna regla se ha activado con este contenido." />;
  }

  return (
    <ol className="border-b border-line">
      {signals.map((s, i) => (
        <li key={s.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-4 border-t border-line py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-x-6">
          <span className="pt-1 font-mono text-xs text-accent">{i + 1}</span>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-semiwide text-xl font-semibold text-fg">{s.title}</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                {s.ruleId} · {SIGNAL_CATEGORY_LABEL[s.category]}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              <span className="text-fg/90">Por qué importa: </span>
              {s.description}
            </p>
            {s.evidence && (
              <p className="mt-3">
                <span className="border-b-2 border-accent-strong pb-0.5 font-mono text-[13px] leading-loose text-fg">«{s.evidence}»</span>
              </p>
            )}
          </div>
          <span className="font-wide text-xl font-bold tabular-nums text-fg sm:text-2xl">+{s.weight}</span>
        </li>
      ))}
    </ol>
  );
}
