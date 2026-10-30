import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const POINTS = ['Detecta señales de phishing antes de hacer clic.', 'Cada punto de la puntuación tiene una regla detrás.', 'Comprueba enlaces sin necesidad de abrirlos.'];

/** Diseño a dos columnas para login y registro. */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-12 lg:flex xl:p-16">
        <Logo />
        <div className="max-w-md">
          <p className="eyebrow">Protección antes del clic</p>
          <h2 className="mt-6 font-semiwide text-[2.8rem] font-semibold uppercase leading-[1] text-fg">
            Un minuto de duda <span className="text-accent-strong">vale la pena</span>
          </h2>
          <ol className="mt-12">
            {POINTS.map((text, i) => (
              <li key={text} className="flex gap-5 border-t border-line py-4 text-[15px] text-muted">
                <span className="font-mono text-xs leading-6 text-subtle">{String(i + 1).padStart(2, '0')}</span>
                {text}
              </li>
            ))}
          </ol>
        </div>
        <p
          className="text-outline -mb-16 select-none whitespace-nowrap font-wide text-[7.5rem] font-bold uppercase leading-none tracking-[-0.035em] xl:text-[9rem]"
          aria-hidden
        >
          Guard
        </p>
      </aside>

      <main className="flex flex-col px-[var(--gutter)] py-6">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al inicio
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[26rem] animate-fade-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
