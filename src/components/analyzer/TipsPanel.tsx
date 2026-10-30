import { Lock } from 'lucide-react';
import { Panel } from '@/components/common/Panel';
import { ANALYZER_TIPS } from '@/data/content';

/** Columna de ayuda del analizador: consejos del boceto de Figma y aviso de privacidad, como notas al margen. */
export function TipsPanel({ className }: { className?: string }) {
  return (
    <aside className={className} aria-label="Consejos para analizar">
      <Panel label="Antes de analizar" padding="lg" className="h-full">
        <ol className="space-y-5">
          {ANALYZER_TIPS.map((tip, i) => (
            <li key={tip} className="flex gap-4 text-[15px] leading-snug text-fg/90">
              <span className="font-mono text-[11px] leading-5 text-accent">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
        <div className="mt-8 border-t border-line pt-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Privacidad
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            En esta versión nada sale de tu navegador: el motor de análisis aún no está conectado y no se guarda ningún contenido.
          </p>
        </div>
      </Panel>
    </aside>
  );
}
