import { useState, type FormEvent } from 'react';
import { CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ANALYZER_EXAMPLES } from '@/data/analyzerExamples';
import { isValidUrl } from '@/utils/validation';
import { FormActions } from './FormActions';
import type { AnalyzerFormProps } from './types';

export function UrlForm({ onSubmit, busy }: AnalyzerFormProps) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const valid = isValidUrl(value);
  const error = touched && value.length > 0 && !valid ? 'No parece una dirección web válida (ej. https://dominio.com/ruta).' : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit({ type: 'url', content: value.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="url-input"
        label="Dirección web"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://ejemplo.com/iniciar-sesion"
        icon={Globe}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        error={error}
        className="font-mono text-[13px]"
        hint="Copia el enlace con clic derecho → «Copiar dirección del enlace». No hace falta abrirlo."
        trailing={valid ? <CheckCircle2 className="mr-2.5 h-4 w-4 text-safe" aria-label="Formato válido" /> : undefined}
        aside={
          <button
            type="button"
            onClick={() => {
              setValue(ANALYZER_EXAMPLES.url);
              setTouched(true);
            }}
            className="inline-flex items-center gap-1 rounded text-xs text-accent transition hover:text-accent-strong"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cargar ejemplo
          </button>
        }
      />

      <div className="rounded-xl border border-line bg-surface-2/60 p-4 text-sm text-muted">
        <p className="font-medium text-fg">Qué se revisará</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {['Dominio y subdominios', 'Parecido con marcas conocidas', 'Acortadores y redirecciones', 'Protocolo y parámetros'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <FormActions
        busy={busy}
        canClear={value.length > 0}
        onClear={() => {
          setValue('');
          setTouched(false);
        }}
      />
    </form>
  );
}
