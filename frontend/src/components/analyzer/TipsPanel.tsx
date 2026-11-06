import { useId, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { Panel } from '@/components/common/Panel';
import { ANALYZER_TIPS } from '@/data/content';
import { cn } from '@/utils/cn';

/**
 * Columna de ayuda del analizador: consejos del boceto de Figma y aviso de privacidad, como notas al margen.
 * En pantallas pequeñas los consejos se pliegan para que el resultado quede cerca del botón.
 */
export function TipsPanel({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <aside className={className} aria-label="Consejos para analizar">
      <Panel
        label="Antes de analizar"
        padding="lg"
        className="h-full"
        aside={
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={listId}
            className="-my-2.5 -mr-2 flex h-11 items-center gap-1.5 px-2 text-xs text-muted transition-colors hover:text-fg lg:hidden"
          >
            {open ? 'Ocultar consejos' : 'Ver consejos'}
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-base ease-out', open && 'rotate-180')} aria-hidden />
          </button>
        }
      >
        <ol id={listId} className={cn('space-y-5', !open && 'hidden lg:block')}>
          {ANALYZER_TIPS.map((tip, i) => (
            <li key={tip} className="flex gap-4 text-[15px] leading-snug text-fg/90">
              <span className="font-mono text-[11px] leading-5 text-accent">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
        <div className={open ? 'mt-8 border-t border-line pt-6' : 'lg:mt-8 lg:border-t lg:border-line lg:pt-6'}>
          <p className="flex items-center gap-2 label text-subtle">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Privacidad
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            En esta versión nada sale de tu navegador: el motor de análisis aún no está conectado y no se guarda ningún contenido.
          </p>
        </div>
      </Panel>
    </aside>
  );
}
