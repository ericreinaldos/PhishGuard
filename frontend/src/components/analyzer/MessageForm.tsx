import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { focusFirstInvalid } from '@/utils/focus';
import { submitOnCtrlEnter } from '@/utils/keyboard';
import { FormActions } from './FormActions';
import { ANALYZER_EXAMPLES, MESSAGE_MAX_LENGTH } from '@/data/analyzerExamples';
import type { AnalyzerFormProps } from './types';

const MIN_LENGTH = 20;

export function MessageForm({ onSubmit, busy, value, onValueChange }: AnalyzerFormProps) {
  const [error, setError] = useState<string>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().length < MIN_LENGTH) {
      setError(`Pega el mensaje completo (mínimo ${MIN_LENGTH} caracteres) para obtener un análisis útil.`);
      focusFirstInvalid(e.currentTarget as HTMLFormElement);
      return;
    }
    setError(undefined);
    onSubmit({ type: 'message', content: value.trim() });
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={(e) => submitOnCtrlEnter(e, busy)} noValidate className="space-y-5">
      <Textarea
        id="message-input"
        label="Contenido del mensaje"
        placeholder="Pega aquí el mensaje que te ha llegado y lo analizamos."
        rows={8}
        value={value}
        maxLength={MESSAGE_MAX_LENGTH}
        showCount
        onChange={(e) => {
          onValueChange(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
        hint="Funciona con correos, SMS, WhatsApp o cualquier texto. Incluye el remitente si lo conoces."
        aside={
          <button
            type="button"
            onClick={() => onValueChange(ANALYZER_EXAMPLES.message)}
            className="inline-flex min-h-6 items-center gap-1 rounded text-xs text-accent transition-colors hover:text-fg"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cargar ejemplo
          </button>
        }
      />
      <FormActions busy={busy} canClear={value.length > 0} onClear={() => onValueChange('')} />
    </form>
  );
}
