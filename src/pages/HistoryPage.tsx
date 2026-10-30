import { useMemo, useState } from 'react';
import { History, Search, SearchX, ScanSearch } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { DemoNotice } from '@/components/common/DemoNotice';
import { AnalysesTable } from '@/components/common/AnalysesTable';
import { DEMO_ANALYSES } from '@/data/demoAnalyses';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { AnalysisType, RiskLevel } from '@/types/analysis';
import { ANALYSIS_TYPE_CONFIG, RISK_CONFIG, RISK_LEVELS } from '@/utils/risk';
import { cn } from '@/utils/cn';

type Filter<T> = T | 'all';

/** Filtro como fila de opciones de texto con subrayado azul (mismo gesto que las pestañas). */
function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Filter<T>;
  options: Array<{ id: T; label: string }>;
  onChange: (v: Filter<T>) => void;
}) {
  const all = [{ id: 'all' as const, label: 'Todos' }, ...options];
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="w-16 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{label}</span>
      {all.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative py-1 text-[15px] transition-colors',
              active ? 'text-fg after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent-strong' : 'text-muted hover:text-fg',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function HistoryPage() {
  useDocumentTitle('Historial');
  const [showDemo, setShowDemo] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<Filter<AnalysisType>>('all');
  const [level, setLevel] = useState<Filter<RiskLevel>>('all');

  // Hoy la fuente son datos de demostración; mañana será listAnalyses().
  const source = showDemo ? DEMO_ANALYSES : [];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter(
      (r) => (type === 'all' || r.type === type) && (level === 'all' || r.level === level) && (!q || r.preview.toLowerCase().includes(q) || r.id.includes(q)),
    );
  }, [source, query, type, level]);

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setLevel('all');
  };

  return (
    <>
      <PageHeader
        eyebrow="Historial"
        title={
          <>
            Historial de <span className="text-accent-strong">análisis</span>
          </>
        }
        description="Consulta, filtra y vuelve a abrir los análisis que has realizado."
        actions={
          <div className="w-full sm:w-72">
            <Switch id="toggle-demo" checked={showDemo} onChange={setShowDemo} label="Mostrar datos de demostración" />
          </div>
        }
      />

      {source.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aún no hay análisis en tu historial"
          description="Cuando realices análisis con una cuenta, aparecerán aquí para que puedas revisarlos."
          action={
            <ButtonLink to="/analyzer" leftIcon={ScanSearch}>
              Hacer un análisis
            </ButtonLink>
          }
        />
      ) : (
        <>
          <DemoNotice className="mb-10">Los registros de esta tabla son ficticios. El historial aún no se guarda.</DemoNotice>

          {/* Barra de búsqueda y filtros */}
          <div className="grid grid-cols-1 gap-8 border-y border-line py-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Input id="history-search" label="Buscar" type="search" placeholder="Contenido o identificador…" icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex flex-col justify-end gap-4 lg:col-span-7">
              <FilterChips
                label="Tipo"
                value={type}
                onChange={setType}
                options={(Object.keys(ANALYSIS_TYPE_CONFIG) as AnalysisType[]).map((id) => ({ id, label: ANALYSIS_TYPE_CONFIG[id].label }))}
              />
              <FilterChips label="Riesgo" value={level} onChange={setLevel} options={RISK_LEVELS.map((id) => ({ id, label: RISK_CONFIG[id].label }))} />
            </div>
          </div>

          <p className="mb-2 mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle" aria-live="polite">
            {rows.length} de {source.length} análisis
          </p>

          <AnalysesTable
            rows={rows}
            detailHref={(r) => `/results?demo=1&id=${r.id}`}
            empty={
              <EmptyState
                icon={SearchX}
                title="Ningún análisis coincide con los filtros"
                description="Prueba con otros términos o elimina algún filtro."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            }
          />
        </>
      )}
    </>
  );
}
