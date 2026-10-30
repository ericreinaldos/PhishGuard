import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Oculta la columna por debajo de este punto de ruptura. */
  hideBelow?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption: string;
  empty?: ReactNode;
}

const HIDE: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/** Tabla genérica tipada. Recibe las filas ya filtradas; no conoce el origen de los datos. */
export function DataTable<T>({ columns, rows, getRowKey, caption, empty }: DataTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-[15px] sm:min-w-[520px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'border-b border-line px-4 pb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-subtle first:pl-0 last:pr-0',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  col.hideBelow && HIDE[col.hideBelow],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="group">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'border-b border-line px-4 py-5 align-middle transition-colors first:pl-0 last:pr-0 group-hover:bg-surface/60',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.hideBelow && HIDE[col.hideBelow],
                    col.className,
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
