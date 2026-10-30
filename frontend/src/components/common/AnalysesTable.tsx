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
}

/** Tabla de análisis compartida por el dashboard y el historial. */
export function AnalysesTable({ rows, detailHref, empty, compact }: AnalysesTableProps) {
  const columns: Column<AnalysisSummary>[] = [
    {
      key: 'content',
      header: 'Contenido',
      render: (r) => (
        <div className="min-w-0">
          <p className="max-w-[11rem] truncate text-fg sm:max-w-[18rem] lg:max-w-[22rem]" title={r.preview}>
            {truncate(r.preview, 80)}
          </p>
          <div className="mt-0.5 sm:hidden">
            <TypeLabel type={r.type} />
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Tipo', render: (r) => <TypeLabel type={r.type} />, hideBelow: 'sm' },
    ...(compact
      ? []
      : [{ key: 'date', header: 'Fecha', render: (r: AnalysisSummary) => <span className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</span>, hideBelow: 'md' as const }]),
    { key: 'verdict', header: 'Veredicto', render: (r) => <RiskBadge level={r.level} /> },
    { key: 'score', header: 'Puntuación', render: (r) => <ScoreBar score={r.score} />, hideBelow: 'lg' },
    {
      key: 'detail',
      header: 'Detalle',
      align: 'right',
      className: 'w-12',
      render: (r) => (
        <Link
          to={detailHref(r)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition hover:bg-surface-3 hover:text-accent"
          aria-label={`Ver detalle del análisis ${r.id}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} caption="Análisis realizados" empty={empty} />;
}
