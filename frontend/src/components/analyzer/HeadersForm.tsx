import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { ANALYZER_EXAMPLES, HEADERS_MAX_LENGTH } from '@/data/analyzerExamples';
import { looksLikeEmailHeaders } from '@/utils/validation';
import { FormActions } from './FormActions';
import type { AnalyzerFormProps } from './types';

const CLIENTS = [
  { name: 'Gmail', path: 'Menú ⋮ del correo → «Mostrar original»' },
  { name: 'Outlook', path: 'Archivo → Propiedades → «Encabezados de Internet»' },
  { name: 'Apple Mail', path: 'Visualización → Mensaje → «Todas las cabeceras»' },
  { name: 'Thunderbird', path: 'Ver → Código fuente del mensaje' },
];

export function HeadersForm({ onSubmit, busy }: AnalyzerFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  const showFormatWarning = value.trim().length > 40 && !looksLikeEmailHeaders(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Pega las cabeceras del correo para analizarlas.');
      return;
    }
    setError(undefined);
    onSubmit({ type: 'headers', content: value.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Textarea
        id="headers-input"
        label="Cabeceras del correo"
        placeholder={'Received: from …\nAuthentication-Results: …\nFrom: …'}
        rows={11}
        mono
        spellCheck={false}
        value={value}
        maxLength={HEADERS_MAX_LENGTH}
        showCount
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
        hint="Las cabeceras revelan el servidor real de envío y si el correo supera SPF, DKIM y DMARC."
        aside={
          <button
            type="button"
            onClick={() => setValue(ANALYZER_EXAMPLES.headers)}
            className="inline-flex items-center gap-1 rounded text-xs text-accent transition hover:text-accent-strong"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cargar ejemplo
          </button>
        }
      />

      {showFormatWarning && (
        <Alert tone="warning" title="Esto no parece una cabecera de correo">
          Asegúrate de copiar el código fuente completo del mensaje, no solo el texto visible.
        </Alert>
      )}

      <details className="group rounded-xl border border-line bg-surface-2/60 p-4 text-sm">
        <summary className="cursor-pointer list-none font-medium text-fg marker:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="text-accent transition group-open:rotate-90" aria-hidden>
              ›
            </span>
            ¿Dónde encuentro las cabeceras?
          </span>
        </summary>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {CLIENTS.map((c) => (
            <div key={c.name}>
              <dt className="text-xs font-medium text-fg">{c.name}</dt>
              <dd className="mt-0.5 text-xs text-muted">{c.path}</dd>
            </div>
          ))}
        </dl>
      </details>

      <FormActions busy={busy} canClear={value.length > 0} onClear={() => setValue('')} />
    </form>
  );
}
