import { Link, Outlet } from 'react-router-dom';
import { AppNavbar } from '@/components/layout/AppNavbar';

/**
 * Zona de trabajo: misma cabecera, márgenes y ritmo que la home.
 * Usa scroll nativo (sin Lenis) para que formularios, tablas y áreas de texto respondan al instante.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent-strong focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <AppNavbar />
      <main id="contenido" className="container-page flex-1 pb-20 pt-28 sm:pt-32">
        <Outlet />
      </main>
      <footer className="container-page">
        <div className="flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] text-subtle sm:flex-row sm:justify-between">
          <p>PhishGuard · v0.3.0 · frontend sin backend</p>
          <Link to="/" className="transition-colors hover:text-fg">
            Volver a la web pública
          </Link>
        </div>
      </footer>
    </div>
  );
}
