import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Panel } from '@/components/common/Panel';
import { ANALYZER_TIPS } from '@/data/content';
import { cn } from '@/utils/cn';

/**
 * Columna de ayuda del analizador: consejos del boceto de Figma, como notas al margen.
 * En pantallas pequeñas se pliegan para que el resultado quede cerca del botón.
 */
export function TipsPanel({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <aside className={className} aria-label="Consejos para analizar">
      <Panel
        label="Antes de analizar"
        padding="none"
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
        <ol id={listId} className={cn('space-y-5 p-5 sm:p-8', !open && 'hidden lg:block')}>
          {ANALYZER_TIPS.map((tip, i) => (
            <li key={tip} className="flex gap-4 text-[15px] leading-snug text-fg/90">
              <span className="font-mono text-[11px] leading-5 text-accent">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
      </Panel>
    </aside>
  );
}
