import { FileBarChart2, RotateCcw, ScanSearch } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Panel } from '@/components/common/Panel';
import { ScoreGauge } from '@/components/common/ScoreGauge';
import { RiskBadge } from '@/components/common/RiskBadge';
import type { AnalysisStatus } from '@/hooks/useAnalysisSubmit';
import { ANALYSIS_TYPE_CONFIG } from '@/utils/risk';
import { formatNumber } from '@/utils/format';

interface ResultPanelProps {
  status: AnalysisStatus;
  onReset: () => void;
}

const STATE_LABEL: Record<AnalysisStatus['state'], string> = {
  idle: 'En espera',
  loading: 'Analizando…',
  pending: 'Motor pendiente',
  success: 'Completado',
  error: 'Error',
};

/** Zona bajo el formulario donde aparece el resultado del análisis. */
export function ResultPanel({ status, onReset }: ResultPanelProps) {
  return (
    <section aria-labelledby="result-title" aria-live="polite">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id="result-title" className="eyebrow" style={{ fontStretch: '100%' }}>
          Resultado
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{STATE_LABEL[status.state]}</span>
      </div>

      {status.state === 'idle' && (
        <EmptyState
          icon={ScanSearch}
          title="El resultado aparecerá aquí"
          description="Introduce el contenido y pulsa «Analizar». Verás el nivel de riesgo, las señales detectadas y qué hacer a continuación."
        />
      )}

      {status.state === 'loading' && (
        <div className="border-y border-line py-14">
          <Spinner label="Analizando contenido…" />
        </div>
      )}

      {status.state === 'pending' && (
        <Panel label={`${ANALYSIS_TYPE_CONFIG[status.request.type].label} · ${formatNumber(status.request.content.length)} caracteres`} padding="lg" className="animate-fade-up">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
            <ScoreGauge score={null} size={170} className="mx-auto" />
            <div className="space-y-5">
              <Alert tone="info" title="Motor de análisis pendiente de integración">
                Hemos recibido el contenido, pero todavía no hay un motor de reglas conectado, así que no se ha generado ninguna puntuación.
              </Alert>
              <div className="flex flex-wrap gap-3">
                <ButtonLink to="/results?demo=1" variant="outline" leftIcon={FileBarChart2}>
                  Ver informe de demostración
                </ButtonLink>
                <Button variant="ghost" leftIcon={RotateCcw} onClick={onReset}>
                  Nuevo análisis
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {status.state === 'success' && (
        <Panel padding="lg" className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoreGauge score={status.result.score} size={120} />
            <div>
              <p className="font-semiwide text-xl font-semibold text-fg">{status.result.verdict}</p>
              <RiskBadge level={status.result.level} className="mt-2" />
            </div>
          </div>
          <ButtonLink to={`/results?id=${status.result.id}`} leftIcon={FileBarChart2}>
            Ver informe completo
          </ButtonLink>
        </Panel>
      )}

      {status.state === 'error' && (
        <Alert tone="danger" title="No se pudo completar el análisis" action={<Button variant="ghost" size="sm" leftIcon={RotateCcw} onClick={onReset}>Reintentar</Button>}>
          {status.message}
        </Alert>
      )}
    </section>
  );
}
