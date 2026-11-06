import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { StatMetric } from '@/types/stats';
import { cn } from '@/utils/cn';

const TREND = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
};

/** Cifra editorial: etiqueta técnica, número grande y variación. Sin tarjeta, separada por una línea. */
export function StatCard({ metric }: { metric: StatMetric }) {
  const TrendIcon = metric.trend ? TREND[metric.trend] : null;
  return (
    <div className="border-t border-line pt-5">
      <p className="label text-subtle">{metric.label}</p>
      <p className="mt-4 whitespace-nowrap font-wide text-[2.6rem] font-bold leading-none tracking-[-0.02em] tabular-nums text-fg sm:text-[3rem] md:text-[2.6rem] lg:text-[3rem]">
        {metric.value}
      </p>
      {TrendIcon && metric.delta && (
        <p className="mt-3 inline-flex items-start gap-1 text-xs text-muted lg:items-center lg:whitespace-nowrap">
          <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="text-fg">{metric.delta}</span> respecto a la semana anterior
        </p>
      )}
    </div>
  );
}

/** Fila de cifras a todo el ancho. */
export function StatGrid({ metrics, className }: { metrics: StatMetric[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2', metrics.length >= 4 ? 'xl:grid-cols-4' : 'md:grid-cols-3', className)}>
      {metrics.map((m) => (
        <StatCard key={m.id} metric={m} />
      ))}
    </div>
  );
}
