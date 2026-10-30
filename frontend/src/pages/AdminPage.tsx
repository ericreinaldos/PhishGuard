import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { StatGrid } from '@/components/common/StatCard';
import { DemoNotice } from '@/components/common/DemoNotice';
import { DataTable, type Column } from '@/components/common/DataTable';
import { RiskBadge } from '@/components/common/RiskBadge';
import { TypeLabel } from '@/components/common/TypeLabel';
import { Panel } from '@/components/common/Panel';
import { Section } from '@/components/common/Section';
import { BarChart } from '@/components/charts/BarChart';
import { RiskDistribution } from '@/components/charts/RiskDistribution';
import { HorizontalBars } from '@/components/charts/HorizontalBars';
import { DEMO_ADMIN_DAILY, DEMO_ADMIN_EVENTS, DEMO_ADMIN_METRICS, DEMO_ADMIN_RISK, DEMO_ADMIN_TYPES } from '@/data/demoStats';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import type { ActivityEvent } from '@/types/stats';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const SECTIONS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'users', label: 'Usuarios' },
  { id: 'rules', label: 'Reglas' },
  { id: 'logs', label: 'Registros' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const EVENT_COLUMNS: Column<ActivityEvent>[] = [
  { key: 'title', header: 'Evento', render: (e) => <span className="text-fg">{e.title}</span> },
  { key: 'detail', header: 'Detalle', render: (e) => <span className="text-muted">{e.detail}</span>, hideBelow: 'md' },
  { key: 'level', header: 'Nivel', render: (e) => (e.level ? <RiskBadge level={e.level} /> : <span className="text-subtle">—</span>) },
  { key: 'date', header: 'Fecha', align: 'right', render: (e) => <span className="whitespace-nowrap font-mono text-xs text-subtle">{formatDateTime(e.createdAt)}</span> },
];

export function AdminPage() {
  useDocumentTitle('Administración');
  const { notifyPending } = useToast();
  const [section, setSection] = useState<SectionId>('overview');

  const selectSection = (id: SectionId, label: string) => {
    if (id === 'overview') setSection(id);
    else notifyPending(`La sección «${label}» del panel de administración`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title={
          <>
            Estado de la <span className="text-accent-strong">plataforma</span>
          </>
        }
        description="Visión global de la actividad, el riesgo detectado y los eventos recientes."
        actions={<Badge tone="warning">Vista previa · sin permisos reales</Badge>}
      />

      <nav aria-label="Secciones de administración" className="mb-10 flex gap-8 overflow-x-auto border-b border-line">
        {SECTIONS.map(({ id, label }, i) => (
          <button
            key={id}
            type="button"
            onClick={() => selectSection(id, label)}
            aria-current={section === id ? 'page' : undefined}
            className={cn(
              '-mb-px flex items-baseline gap-2 whitespace-nowrap border-b-2 pb-4 text-[15px] transition-colors',
              section === id ? 'border-accent-strong text-fg' : 'border-transparent text-muted hover:text-fg',
            )}
          >
            <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>

      <DemoNotice className="mb-12">Todas las cifras del panel son ficticias. No existen usuarios ni análisis registrados.</DemoNotice>

      <StatGrid metrics={DEMO_ADMIN_METRICS} className="mb-6" />

      <Section index={1} layout="stacked" title="Actividad y riesgo" description="Últimos 7 días">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Panel label="Análisis por día" className="lg:col-span-7">
            <BarChart data={DEMO_ADMIN_DAILY} seriesLabel="Análisis por día" />
          </Panel>
          <Panel label="Distribución de riesgo" className="lg:col-span-5">
            <RiskDistribution data={DEMO_ADMIN_RISK} />
          </Panel>
        </div>
      </Section>

      <Section index={2} layout="stacked" title="Uso y eventos">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Por tipo de análisis</p>
            <HorizontalBars items={DEMO_ADMIN_TYPES.map((t) => ({ key: t.type, label: <TypeLabel type={t.type} />, value: t.count }))} />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Actividad reciente</p>
            <DataTable columns={EVENT_COLUMNS} rows={DEMO_ADMIN_EVENTS} getRowKey={(e) => e.id} caption="Actividad reciente de la plataforma" />
          </div>
        </div>
      </Section>
    </>
  );
}
