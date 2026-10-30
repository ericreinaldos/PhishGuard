import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { cn } from '@/utils/cn';

export interface HeaderLink {
  label: string;
  to: string;
}

interface SiteHeaderProps {
  links: readonly HeaderLink[];
  isActive: (to: string) => boolean;
  /** Acciones a la derecha en escritorio. */
  actions: ReactNode;
  /** Acciones al pie del menú móvil. */
  mobileActions: ReactNode;
  logoTo?: string;
  /** Fondo opaco desde el principio (páginas interiores). Si no, se vuelve opaco al hacer scroll. */
  solid?: boolean;
}

/**
 * Cabecera común a toda la web: fija, discreta y con menú móvil a pantalla completa.
 * La usan la navegación pública (Navbar) y la de la aplicación (AppNavbar).
 */
export function SiteHeader({ links, isActive, actions, mobileActions, logoTo = '/', solid }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { lenis } = useSmoothScroll();
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => setOpen(false), [location.pathname, location.hash, location.key]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menú móvil: bloquea el scroll de fondo, enfoca el primer enlace y se cierra con Escape
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, lenis]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300',
        solid || scrolled || open ? 'border-line bg-bg' : 'border-transparent bg-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6" aria-label="Principal">
        <Logo to={logoTo} />

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((item) => {
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn('relative py-2 text-sm transition-colors', active ? 'text-fg' : 'text-muted hover:text-fg')}
                >
                  {item.label}
                  {active && <span className="absolute -bottom-[1px] left-0 right-0 h-px bg-accent-strong" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">{actions}</div>

        <button
          type="button"
          className="-mr-2 flex h-10 items-center gap-3 px-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? 'Cerrar' : 'Menú'}
          <span className="relative block h-2.5 w-5" aria-hidden>
            <span className={cn('absolute left-0 h-px w-5 bg-current transition-transform duration-300', open ? 'top-1 rotate-45' : 'top-0')} />
            <span className={cn('absolute left-0 h-px w-5 bg-current transition-transform duration-300', open ? 'top-1 -rotate-45' : 'top-2.5')} />
          </span>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 flex flex-col overflow-y-auto bg-bg lg:hidden">
          <ul className="container-page flex-1 pt-6">
            {links.map((item, i) => (
              <li key={item.to} className="animate-fade-up border-b border-line" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  ref={i === 0 ? firstLink : undefined}
                  to={item.to}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                  className={cn(
                    'flex items-baseline gap-4 py-5 font-semiwide text-[1.75rem] font-semibold uppercase leading-none',
                    isActive(item.to) ? 'text-accent' : 'text-fg',
                  )}
                >
                  <span className="font-mono text-xs font-normal text-subtle">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="container-page grid gap-3 pb-8 pt-8">{mobileActions}</div>
        </div>
      )}
    </header>
  );
}
