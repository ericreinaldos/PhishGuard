import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions } from './FormActions';
import { ANALYZER_EXAMPLES, MESSAGE_MAX_LENGTH } from '@/data/analyzerExamples';
import type { AnalyzerFormProps } from './types';

const MIN_LENGTH = 20;

export function MessageForm({ onSubmit, busy }: AnalyzerFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().length < MIN_LENGTH) {
      setError(`Pega el mensaje completo (mínimo ${MIN_LENGTH} caracteres) para obtener un análisis útil.`);
      return;
    }
    setError(undefined);
    onSubmit({ type: 'message', content: value.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Textarea
        id="message-input"
        label="Contenido del mensaje"
        placeholder="Pega aquí el mensaje que te ha llegado y lo analizamos."
        rows={12}
        className="text-base"
        value={value}
        maxLength={MESSAGE_MAX_LENGTH}
        showCount
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
        hint="Funciona con correos, SMS, WhatsApp o cualquier texto. Incluye el remitente si lo conoces."
        aside={
          <button
            type="button"
            onClick={() => setValue(ANALYZER_EXAMPLES.message)}
            className="inline-flex items-center gap-1 rounded text-xs text-accent transition hover:text-accent-strong"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cargar ejemplo
          </button>
        }
      />
      <FormActions busy={busy} canClear={value.length > 0} onClear={() => setValue('')} />
    </form>
  );
}
