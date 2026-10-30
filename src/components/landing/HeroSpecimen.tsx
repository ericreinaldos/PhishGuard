import type { ReactNode } from 'react';
import { Link2 } from 'lucide-react';

/** Frase marcada como si un revisor la hubiera subrayado y numerado. */
function Mark({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="relative inline whitespace-nowrap text-fg">
      {children}
      <sup className="ml-0.5 font-mono text-[10px] font-medium text-accent">{n}</sup>
      <span data-mark className="absolute -bottom-0.5 left-0 right-3 h-[2px] bg-accent-strong" aria-hidden />
    </span>
  );
}

const NOTES = [
  { n: 1, label: 'Tono alarmista', points: 5 },
  { n: 2, label: 'Urgencia', points: 25 },
  { n: 3, label: 'Enlace sospechoso', points: 35 },
  { n: 4, label: 'Suplantación', points: 25 },
];

/**
 * Composición del hero: un correo de phishing «corregido» con anotaciones al margen.
 * Es ilustrativo y está etiquetado como tal.
 */
export function HeroSpecimen() {
  const total = NOTES.reduce((s, n) => s + n.points, 0);
  return (
    <figure data-specimen className="relative overflow-hidden rounded-2xl border border-line bg-surface">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 font-mono text-[11px] text-subtle sm:px-7">
        <span className="truncate">De: Seguridad &lt;avisos@banco-avisos.co&gt;</span>
        <span className="shrink-0 uppercase tracking-[0.16em]">Ejemplo ilustrativo</span>
      </figcaption>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <p className="font-semiwide text-lg font-semibold text-fg">Aviso importante sobre su cuenta</p>
          <div className="mt-4 space-y-4 text-[15px] leading-[1.85] text-muted">
            <p>
              Estimado cliente: hemos detectado un acceso inusual y su cuenta ha sido <Mark n={1}>SUSPENDIDA</Mark>. Para evitar el bloqueo
              definitivo, verifique sus datos <Mark n={2}>en las próximas 24 horas</Mark>:
            </p>
            <p>
              <span className="relative inline-flex max-w-full items-center gap-1.5 rounded-md border border-line-strong bg-bg px-2 py-1 font-mono text-[12px] text-fg">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                <span className="truncate">banco-seguro-verificacion.co/acceso</span>
                <sup className="font-mono text-[10px] font-medium text-accent">3</sup>
                <span data-mark className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent-strong" aria-hidden />
              </span>
            </p>
            <p>
              Atentamente,
              <br />
              <Mark n={4}>Departamento de Seguridad</Mark>
            </p>
          </div>
        </div>

        {/* Notas al margen */}
        <div className="border-t border-line bg-bg/40 px-5 py-6 sm:border-l sm:border-t-0 sm:px-6 sm:py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Señales</p>
          <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-1">
            {NOTES.map((note) => (
              <li key={note.n} data-note className="flex items-baseline gap-2 text-[13px]">
                <span className="font-mono text-[10px] text-accent">{note.n}</span>
                <span className="flex-1 text-muted">{note.label}</span>
                <span className="font-mono text-xs text-fg">+{note.points}</span>
              </li>
            ))}
          </ol>
          <div data-note className="mt-6 border-t border-line pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Nivel de riesgo</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-wide text-2xl font-bold uppercase text-danger">Alto</span>
              <span className="font-mono text-xs text-muted">{total}/100</span>
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
