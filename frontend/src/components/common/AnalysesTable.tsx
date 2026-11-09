import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { AnalysisSummary } from '@/types/analysis';
import { DataTable, type Column } from './DataTable';
import { RiskBadge } from './RiskBadge';
import { ScoreBar } from './ScoreBar';
import { TypeLabel } from './TypeLabel';
import { formatDateTime, truncate } from '@/utils/format';

interface AnalysesTableProps {
  rows: AnalysisSummary[];
  /** Enlace al detalle de cada fila. */
  detailHref: (row: AnalysisSummary) => string;
  empty?: ReactNode;
  compact?: boolean;
  /** Filas más bajas para ver más registros a la vez. */
  dense?: boolean;
}

/**
 * Tabla de análisis compartida por el dashboard y el historial.
 * Toda la fila abre el detalle: el enlace de la primera celda se extiende sobre ella con un pseudoelemento.
 */
export function AnalysesTable({ rows, detailHref, empty, compact, dense }: AnalysesTableProps) {
  const columns: Column<AnalysisSummary>[] = [
    {
      key: 'content',
      header: 'Contenido',
      // Ocupa el espacio libre y recorta dentro de él, sin ensanchar nunca la tabla
      className: 'w-full max-w-0',
      render: (r) => (
        <div className="min-w-0">
          <Link
            to={detailHref(r)}
            title={r.preview}
            className="block truncate text-fg outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
          >
            <span className="sr-only">Ver detalle del análisis: </span>
            {truncate(r.preview, 80)}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:hidden">
            <TypeLabel type={r.type} />
            <RiskBadge level={r.level} />
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Tipo', render: (r) => <TypeLabel type={r.type} />, hideBelow: 'sm' },
    ...(compact
      ? []
      : [{ key: 'date', header: 'Fecha', render: (r: AnalysisSummary) => <span className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</span>, hideBelow: 'md' as const }]),
    { key: 'verdict', header: 'Veredicto', render: (r) => <RiskBadge level={r.level} />, hideBelow: 'sm' },
    { key: 'score', header: 'Puntuación', render: (r) => <ScoreBar score={r.score} />, hideBelow: 'lg' },
    {
      key: 'detail',
      header: <span className="sr-only sm:not-sr-only">Detalle</span>,
      align: 'right',
      className: 'w-8 pl-2 sm:w-12 sm:pl-4',
      render: () => <ChevronRight className="ml-auto h-4 w-4 text-subtle transition-colors group-hover:text-accent" aria-hidden />,
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} caption="Análisis realizados" empty={empty} dense={dense} />;
}
