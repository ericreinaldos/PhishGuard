import type { AnalysisResult } from '@/types/analysis';
import { ANALYSIS_TYPE_CONFIG } from '@/utils/risk';
import { formatDateTime } from '@/utils/format';

/** Información general del análisis (tipo, fecha, motor…), como ficha técnica. */
export function AnalysisMeta({ result }: { result: AnalysisResult }) {
  const rows = [
    { label: 'Identificador', value: result.id },
    { label: 'Tipo', value: ANALYSIS_TYPE_CONFIG[result.type].label },
    { label: 'Fecha', value: formatDateTime(result.createdAt) },
    { label: 'Duración', value: `${result.durationMs} ms` },
    { label: 'Reglas evaluadas', value: result.rulesEvaluated },
    { label: 'Señales activadas', value: result.signals.length },
    { label: 'Versión del motor', value: result.engineVersion },
    { label: 'Puntuación', value: `${result.score} / 100` },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label} className="border-t border-line pt-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{row.label}</dt>
          <dd className="mt-2 truncate text-[15px] text-fg">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
