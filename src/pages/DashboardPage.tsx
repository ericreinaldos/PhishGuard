import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatGrid } from '@/components/common/StatCard';
import { DemoNotice, DemoTag } from '@/components/common/DemoNotice';
import { AnalysesTable } from '@/components/common/AnalysesTable';
import { RiskBadge } from '@/components/common/RiskBadge';
import { Section } from '@/components/common/Section';
import { RiskDistribution } from '@/components/charts/RiskDistribution';
import { DEMO_ANALYSES } from '@/data/demoAnalyses';
import { DEMO_ACTIVITY, DEMO_DASHBOARD_METRICS, DEMO_DASHBOARD_RISK } from '@/data/demoStats';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { AnalysisType } from '@/types/analysis';
import { ANALYSIS_TYPE_CONFIG } from '@/utils/risk';
import { formatDateTime } from '@/utils/format';

const QUICK_MODES: Array<{ type: AnalysisType; text: string }> = [
  { type: 'message', text: 'Pega un correo o un SMS' },
  { type: 'url', text: 'Comprueba un enlace sin abrirlo' },
  { type: 'headers', text: 'Revisa quién envió el correo' },
];

export function DashboardPage() {
  useDocumentTitle('Panel');

  return (
    <>
      <PageHeader
        eyebrow="Panel"
        title={
          <>
            Resumen de <span className="text-accent-strong">actividad</span>
          </>
        }
        description="Tus análisis recientes y el estado general de lo que has comprobado."
      />

      <DemoNotice className="mb-12" />

      <StatGrid metrics={DEMO_DASHBOARD_METRICS} className="mb-6" />

      {/* Acceso rápido: mismas filas con relleno azul que en la home, en versión compacta */}
      <Section index={1} title="¿Te ha llegado algo sospechoso?" description="Elige qué quieres analizar." layout="stacked">
        <ul className="grid grid-cols-1 border-b border-line md:grid-cols-3 md:border-b-0">
          {QUICK_MODES.map(({ type, text }, i) => (
            <li key={type} className="border-t border-line md:border-l md:border-t-0 md:first:border-l-0">
              <Link
                to={type === 'message' ? '/analyzer' : `/analyzer?mode=${type}`}
                className="group relative flex items-center justify-between gap-4 overflow-hidden px-1 py-6 outline-none md:px-6 md:first:pl-0"
              >
                <span
                  className="absolute inset-0 origin-left scale-x-0 bg-accent-strong transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  aria-hidden
                />
                <span className="relative">
                  <span className="font-mono text-[11px] text-subtle transition-colors group-hover:text-white/70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-2 block font-wide text-2xl font-bold uppercase leading-none text-fg transition-colors group-hover:text-white">
                    {ANALYSIS_TYPE_CONFIG[type].label}
                  </span>
                  <span className="mt-2 block text-sm text-muted transition-colors group-hover:text-white/85">{text}</span>
                </span>
                <ArrowUpRight className="relative h-6 w-6 shrink-0 text-muted transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid grid-cols-1 gap-x-10 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <Section
            index={2}
            layout="stacked"
            title={
              <span className="flex items-center gap-3">
                Últimos análisis <DemoTag />
              </span>
            }
            action={
              <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-fg">
                Ver historial <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            <AnalysesTable rows={DEMO_ANALYSES.slice(0, 5)} detailHref={(r) => `/results?demo=1&id=${r.id}`} compact />
          </Section>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <Section index={3} layout="stacked" title="Por nivel de riesgo" description="Últimos 30 días">
            <RiskDistribution data={DEMO_DASHBOARD_RISK} />
          </Section>

          <Section index={4} layout="stacked" title="Actividad reciente">
            <ol>
              {DEMO_ACTIVITY.map((event) => (
                <li key={event.id} className="border-t border-line py-4 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] text-fg">{event.title}</p>
                    <time dateTime={event.createdAt} className="shrink-0 font-mono text-[11px] text-subtle">
                      {formatDateTime(event.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">{event.detail}</p>
                  {event.level && <RiskBadge level={event.level} className="mt-2.5" />}
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </>
  );
}
