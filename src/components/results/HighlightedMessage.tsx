import type { ReactNode } from 'react';
import type { DetectedSignal } from '@/types/analysis';

interface Range {
  start: number;
  end: number;
  n: number;
}

/**
 * Muestra el contenido analizado subrayando cada fragmento que activó una regla,
 * con el número de la señal correspondiente (mismo estilo que el correo del hero).
 * `signals` debe venir en el mismo orden con el que se numeran en la lista de señales.
 */
export function HighlightedMessage({ text, signals }: { text: string; signals: DetectedSignal[] }) {
  const ranges: Range[] = [];
  signals.forEach((s, i) => {
    if (!s.evidence) return;
    const start = text.indexOf(s.evidence);
    if (start === -1) return;
    const end = start + s.evidence.length;
    if (ranges.some((r) => start < r.end && end > r.start)) return;
    ranges.push({ start, end, n: i + 1 });
  });
  ranges.sort((a, b) => a.start - b.start);

  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r) => {
    if (r.start > cursor) parts.push(text.slice(cursor, r.start));
    parts.push(
      <mark key={r.start} className="bg-transparent text-fg shadow-[inset_0_-2px_0_rgb(var(--accent-strong))]">
        {text.slice(r.start, r.end)}
        <sup className="ml-0.5 font-mono text-[10px] font-medium text-accent">{r.n}</sup>
      </mark>,
    );
    cursor = r.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.9] text-muted sm:text-base">{parts}</p>;
}
