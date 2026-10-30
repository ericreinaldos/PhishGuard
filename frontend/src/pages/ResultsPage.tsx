import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, FileBarChart2, FlaskConical, ScanSearch, Share2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { DemoNotice } from '@/components/common/DemoNotice';
import { RiskScale } from '@/components/common/RiskScale';
import { Panel } from '@/components/common/Panel';
import { Section } from '@/components/common/Section';
import { SignalList } from '@/components/results/SignalList';
import { ScoreBreakdown } from '@/components/results/ScoreBreakdown';
import { RecommendationList } from '@/components/results/RecommendationList';
import { AnalysisMeta } from '@/components/results/AnalysisMeta';
import { HighlightedMessage } from '@/components/results/HighlightedMessage';
import { DEMO_RESULT } from '@/data/demoResult';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useReveal } from '@/hooks/useReveal';
import { useToast } from '@/hooks/useToast';
import type { AnalysisResult } from '@/types/analysis';
import { ANALYSIS_TYPE_CONFIG, RISK_CONFIG } from '@/utils/risk';
import { cn } from '@/utils/cn';

const label = 'font-mono text-[11px] uppercase tracking-[0.16em] text-subtle';

/** Cabecera del informe: nivel de riesgo protagonista y puntuación general con su escala. */
function ReportSummary({ result }: { result: AnalysisResult }) {
  const scope = useRef<HTMLDivElement>(null);
  useReveal(scope);
  const risk = RISK_CONFIG[result.level];
  const RiskIcon = risk.icon;

  return (
    <div ref={scope} className="grid grid-cols-1 gap-12 py-10 sm:py-14 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7" data-reveal>
        <p className={label}>Nivel de riesgo</p>
        <p className={cn('mt-4 flex items-center gap-4 font-wide text-[4.2rem] font-bold uppercase leading-[0.85] tracking-[-0.03em] sm:text-[6rem] lg:text-[7rem]', risk.text)}>
          <RiskIcon className="h-10 w-10 shrink-0 sm:h-14 sm:w-14" strokeWidth={1.5} aria-hidden />
          {risk.label}
        </p>
        <h2 className="mt-8 font-semiwide text-2xl font-semibold text-fg sm:text-3xl">{result.verdict}</h2>
        <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-muted">{result.summary}</p>
      </div>

      <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-10" data-reveal data-reveal-delay="0.08">
        <p className={label}>Puntuación general</p>
        <p className="mt-4 font-wide text-[4.2rem] font-bold leading-[0.85] tracking-[-0.03em] tabular-nums text-fg sm:text-[6rem]">
          {result.score}
          <span className="ml-2 font-mono text-base font-normal tracking-normal text-subtle">/ 100</span>
        </p>
        <RiskScale score={result.score} className="mt-10" />
        <p className="mt-6 text-sm leading-relaxed text-muted">
          La puntuación es la suma de los pesos de las {result.signals.length} reglas que se han activado.
        </p>
      </div>
    </div>
  );
}

/** Informe completo, organizado en secciones numeradas como la home. */
function ResultReport({ result }: { result: AnalysisResult }) {
  const { notifyPending } = useToast();
  // Un único orden (por peso) para numerar igual las señales y los subrayados
  const signals = [...result.signals].sort((a, b) => b.weight - a.weight);

  return (
    <>
      <ReportSummary result={result} />

      <Section index={1} title="Contribución a la puntuación" description="Cuánto suma cada tipo de señal sobre 100.">
        <ScoreBreakdown signals={signals} />
      </Section>

      <Section index={2} title={`${ANALYSIS_TYPE_CONFIG[result.type].label} analizado`} description="Los fragmentos que han activado una regla aparecen subrayados y numerados.">
        <Panel label={`${result.input.length} caracteres`} aside={<span className={label}>Contenido original</span>} padding="lg">
          <div className="max-h-96 overflow-auto" data-lenis-prevent>
            <HighlightedMessage text={result.input} signals={signals} />
          </div>
        </Panel>
      </Section>

      <Section index={3} title="Señales detectadas" description={`${signals.length} reglas activadas de ${result.rulesEvaluated} evaluadas, de mayor a menor peso.`}>
        <SignalList signals={signals} />
      </Section>

      <Section index={4} title="Qué hacer ahora" description="Recomendaciones según el tipo de amenaza.">
        <RecommendationList items={result.recommendations} />
      </Section>

      <Section
        index={5}
        title="Información del análisis"
        description="Datos técnicos del informe."
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" leftIcon={Download} onClick={() => notifyPending('La exportación del informe')}>
              Exportar
            </Button>
            <Button variant="ghost" size="sm" leftIcon={Share2} onClick={() => notifyPending('Compartir resultados')}>
              Compartir
            </Button>
          </div>
        }
      >
        <AnalysisMeta result={result} />
      </Section>

      <div className="flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-muted">¿Tienes otro mensaje sospechoso?</p>
        <ButtonLink to="/analyzer" size="lg" leftIcon={ScanSearch}>
          Analizar otro mensaje
        </ButtonLink>
      </div>
    </>
  );
}

export function ResultsPage() {
  useDocumentTitle('Resultados');
  const [params, setParams] = useSearchParams();
  const showDemo = params.get('demo') === '1';
  const requestedId = params.get('id');

  return (
    <>
      <PageHeader
        eyebrow={showDemo ? 'Informe técnico · demostración' : 'Informe técnico'}
        title={
          <>
            Informe de <span className="text-accent-strong">análisis</span>
          </>
        }
        description="Nivel de riesgo, señales detectadas, por qué importan y qué hacer a continuación."
        actions={
          <ButtonLink to="/analyzer" variant="outline" leftIcon={ArrowLeft}>
            Volver al analizador
          </ButtonLink>
        }
      />

      {showDemo ? (
        <>
          <DemoNotice>
            Este informe es un ejemplo fijo para mostrar el diseño{requestedId ? ` (abierto desde el registro ficticio ${requestedId})` : ''}. No es el
            resultado de analizar ningún contenido.
          </DemoNotice>
          <ResultReport result={DEMO_RESULT} />
        </>
      ) : requestedId ? (
        <Alert tone="info" title="Detalle pendiente de integración">
          El análisis «{requestedId}» se cargará desde el backend cuando el historial persistente esté disponible.
        </Alert>
      ) : (
        <EmptyState
          icon={FileBarChart2}
          title="Todavía no hay ningún resultado"
          description="Cuando el motor de reglas esté conectado, aquí verás el informe completo de cada análisis."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/analyzer" leftIcon={ScanSearch}>
                Ir al analizador
              </ButtonLink>
              <Button variant="outline" leftIcon={FlaskConical} onClick={() => setParams({ demo: '1' })}>
                Ver ejemplo de demostración
              </Button>
            </div>
          }
        />
      )}
    </>
  );
}
