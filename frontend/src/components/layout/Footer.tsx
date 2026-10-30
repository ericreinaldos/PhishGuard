import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';

const COLUMNS = [
  {
    title: 'Producto',
    links: [
      { label: 'Analizador', to: '/analyzer' },
      { label: 'Cómo funciona', to: '/#como-funciona' },
      { label: 'Transparencia', to: '/#transparencia' },
      { label: 'Preguntas frecuentes', to: '/#faq' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { label: 'Iniciar sesión', to: '/login' },
      { label: 'Crear cuenta', to: '/register' },
      { label: 'Panel', to: '/dashboard' },
      { label: 'Configuración', to: '/settings' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="container-page grid grid-cols-1 gap-12 pb-12 pt-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <Logo />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">
            Detección de phishing con reglas explicables. Proyecto académico en desarrollo: esta versión es la interfaz y todavía no realiza análisis
            reales.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle" style={{ fontStretch: '100%' }}>
              {col.title}
            </h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[15px] text-muted transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-page">
        <div className="flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] text-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} PhishGuard · Proyecto académico de ciberseguridad</p>
          <p>v0.3.0 · frontend sin backend</p>
        </div>
      </div>

      {/* Firma tipográfica de cierre */}
      <p
        className="text-outline select-none whitespace-nowrap px-[var(--gutter)] pb-2 text-center font-wide font-bold uppercase leading-[0.8] tracking-[-0.035em]"
        style={{ fontSize: 'min(10.4vw, 12rem)' }}
        aria-hidden
      >
        PhishGuard
      </p>
    </footer>
  );
}
