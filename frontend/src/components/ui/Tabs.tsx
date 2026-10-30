import { useRef, type KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Prefijo para enlazar cada pestaña con su panel (`${idPrefix}-panel-${id}`). */
  idPrefix: string;
}

/**
 * Selector de pestañas accesible (roles ARIA + flechas de teclado).
 * Estilo de la home: número técnico, rótulo ancho en mayúsculas y subrayado azul.
 */
export function Tabs<T extends string>({ items, value, onChange, label, idPrefix }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="grid grid-cols-3 border-b border-line">
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`${idPrefix}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn('group relative -mb-px flex flex-col items-start pb-5 pr-2 text-left transition-colors', selected ? 'text-fg' : 'text-subtle hover:text-fg')}
          >
            <span className={cn('font-mono text-[11px] transition-colors', selected ? 'text-accent' : 'text-subtle')}>{String(index + 1).padStart(2, '0')}</span>
            <span className="mt-2 font-semiwide text-[15px] font-semibold uppercase leading-none sm:mt-3 sm:text-2xl lg:text-[1.75rem]">{item.label}</span>
            {item.description && <span className="mt-2 hidden text-sm text-muted sm:block">{item.description}</span>}
            <span
              className={cn(
                'absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent-strong transition-transform duration-300 ease-out',
                selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.15]',
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
