import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ label = 'Cargando…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex items-center gap-2 text-sm text-muted', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
