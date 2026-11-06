import { Eraser, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FormActionsProps {
  busy: boolean;
  canClear: boolean;
  onClear: () => void;
}

/** Botones comunes a las tres modalidades del analizador. */
export function FormActions({ busy, canClear, onClear }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      <p className="hidden text-xs text-subtle sm:mr-auto sm:block">Ctrl+Enter para analizar</p>
      <Button variant="ghost" leftIcon={Eraser} onClick={onClear} disabled={!canClear || busy}>
        Limpiar
      </Button>
      <Button type="submit" size="lg" leftIcon={ScanSearch} loading={busy} aria-keyshortcuts="Control+Enter">
        Analizar
      </Button>
    </div>
  );
}
