import { useLocation } from 'react-router-dom';
import { LogOut, ScanSearch } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { APP_NAV } from '@/data/navigation';
import { DEMO_USER } from '@/data/demoUser';
import { useVisualLogout } from '@/hooks/useVisualLogout';
import { AccountMenu, userInitials } from './AccountMenu';
import { SiteHeader } from './SiteHeader';

/** Navegación de la aplicación: la misma cabecera que la home, con las secciones de trabajo. */
export function AppNavbar() {
  const { pathname } = useLocation();
  const logout = useVisualLogout();

  return (
    <SiteHeader
      solid
      logoTo="/dashboard"
      links={APP_NAV}
      isActive={(to) => pathname.startsWith(to)}
      actions={
        <>
          {pathname !== '/analyzer' && (
            <ButtonLink to="/analyzer" size="sm" leftIcon={ScanSearch}>
              Nuevo análisis
            </ButtonLink>
          )}
          <AccountMenu />
        </>
      }
      mobileActions={
        <>
          <ButtonLink to="/analyzer" size="lg" leftIcon={ScanSearch}>
            Nuevo análisis
          </ButtonLink>
          <div className="mt-4 flex items-center gap-3 border-t border-line pt-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-strong font-mono text-xs text-white">
              {userInitials(DEMO_USER.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{DEMO_USER.name}</p>
              <p className="truncate font-mono text-[11px] text-subtle">{DEMO_USER.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ButtonLink to="/settings" variant="outline" size="lg">
              Configuración
            </ButtonLink>
            <Button variant="outline" size="lg" leftIcon={LogOut} onClick={logout}>
              Salir
            </Button>
          </div>
        </>
      }
    />
  );
}
