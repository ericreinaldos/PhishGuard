import { Lock } from 'lucide-react';

/** Qué ocurre con lo que se pega en el analizador: siempre visible, con o sin el panel de consejos. */
export function PrivacyNote({ className }: { className?: string }) {
  return (
    <p className={className}>
      <span className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden />
        <span>
          <span className="font-medium text-fg">Privacidad.</span> En esta versión nada sale de tu navegador: el motor de análisis aún no está
          conectado y no se guarda ningún contenido.
        </span>
      </span>
    </p>
  );
}
