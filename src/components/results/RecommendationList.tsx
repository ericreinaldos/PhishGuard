import type { Recommendation } from '@/types/analysis';

export function RecommendationList({ items }: { items: Recommendation[] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
      {items.map((r, i) => (
        <li key={r.id} className="border-t border-line pt-5">
          <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="mt-3 font-semiwide text-lg font-semibold text-fg">{r.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.description}</p>
        </li>
      ))}
    </ol>
  );
}
