import { useSearchParams } from 'react-router-dom';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { MessageForm } from '@/components/analyzer/MessageForm';
import { UrlForm } from '@/components/analyzer/UrlForm';
import { HeadersForm } from '@/components/analyzer/HeadersForm';
import { TipsPanel } from '@/components/analyzer/TipsPanel';
import { ResultPanel } from '@/components/analyzer/ResultPanel';
import type { AnalyzerFormProps } from '@/components/analyzer/types';
import { useAnalysisSubmit } from '@/hooks/useAnalysisSubmit';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { AnalysisType } from '@/types/analysis';

const MODES: TabItem<AnalysisType>[] = [
  { id: 'message', label: 'Mensaje', description: 'Correo, SMS o chat' },
  { id: 'url', label: 'URL', description: 'Un enlace sospechoso' },
  { id: 'headers', label: 'Cabeceras', description: 'Origen técnico del correo' },
];

const FORMS: Record<AnalysisType, (props: AnalyzerFormProps) => JSX.Element> = {
  message: MessageForm,
  url: UrlForm,
  headers: HeadersForm,
};

/** Rótulo técnico de la barra del formulario según la modalidad. */
const PANEL_LABEL: Record<AnalysisType, string> = {
  message: 'Entrada · texto del mensaje',
  url: 'Entrada · dirección web',
  headers: 'Entrada · cabeceras del correo',
};

const isAnalysisType = (value: string | null): value is AnalysisType => value === 'message' || value === 'url' || value === 'headers';

export function AnalyzerPage() {
  useDocumentTitle('Analizador');
  const [params, setParams] = useSearchParams();
  const modeParam = params.get('mode');
  const mode: AnalysisType = isAnalysisType(modeParam) ? modeParam : 'message';
  const { status, submit, reset } = useAnalysisSubmit();

  const changeMode = (next: AnalysisType) => {
    setParams(next === 'message' ? {} : { mode: next }, { replace: true });
    reset();
  };

  const Form = FORMS[mode];
  const index = MODES.findIndex((m) => m.id === mode) + 1;

  return (
    <>
      <PageHeader
        eyebrow="Análisis de seguridad"
        title={
          <>
            Analiza antes de <span className="text-accent-strong">confiar.</span>
          </>
        }
        description="Pega un mensaje, una dirección web o las cabeceras de un correo. Buscaremos las señales típicas del phishing y te explicaremos qué significan."
      />

      <Tabs items={MODES} value={mode} onChange={changeMode} label="Modalidad de análisis" idPrefix="analyzer" />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <Panel
          className="lg:col-span-8"
          padding="lg"
          label={PANEL_LABEL[mode]}
          aside={<span className="font-mono text-[11px] text-subtle">{String(index).padStart(2, '0')} / 03</span>}
          id={`analyzer-panel-${mode}`}
          role="tabpanel"
          aria-labelledby={`analyzer-tab-${mode}`}
        >
          {/* key fuerza un formulario limpio al cambiar de modalidad */}
          <Form key={mode} onSubmit={submit} busy={status.state === 'loading'} />
        </Panel>
        <TipsPanel className="lg:col-span-4" />
      </div>

      <div className="mt-16 sm:mt-20">
        <ResultPanel status={status} onReset={reset} />
      </div>
    </>
  );
}
