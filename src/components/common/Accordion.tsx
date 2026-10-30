import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Número opcional que se muestra delante de la pregunta. */
  index?: number;
}

/** Fila desplegable a todo el ancho, separada por líneas finas. */
export function AccordionItem({ title, children, defaultOpen = false, index }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3 className="font-sans" style={{ fontStretch: '100%' }}>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-baseline gap-4 py-6 text-left sm:gap-6"
        >
          {index !== undefined && <span className="w-6 shrink-0 font-mono text-xs text-subtle">{String(index).padStart(2, '0')}</span>}
          <span className={cn('flex-1 text-lg font-medium transition-colors sm:text-xl', open ? 'text-fg' : 'text-fg/85 group-hover:text-fg')}>{title}</span>
          <span className="relative h-4 w-4 shrink-0 self-center" aria-hidden>
            <span className="absolute left-0 top-1/2 h-px w-4 bg-current text-muted" />
            <span className={cn('absolute left-1/2 top-0 h-4 w-px bg-current text-muted transition-transform duration-300 ease-out', open && 'scale-y-0')} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden" {...(open ? {} : { inert: '' })}>
          <div className={cn('max-w-2xl pb-7 text-[15px] leading-relaxed text-muted', index !== undefined && 'sm:pl-12 pl-10')}>{children}</div>
        </div>
      </div>
    </div>
  );
}
