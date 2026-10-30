import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { PUBLIC_NAV } from '@/data/navigation';
import { SiteHeader } from './SiteHeader';

/** Navegación de la zona pública. */
export function Navbar() {
  const location = useLocation();

  const isActive = (to: string) => {
    const [path, hash] = to.split('#');
    return hash ? location.pathname === '/' && location.hash === `#${hash}` : location.pathname === path;
  };

  return (
    <SiteHeader
      links={PUBLIC_NAV}
      isActive={isActive}
      actions={
        <>
          <Link to="/login" className="text-sm text-muted transition-colors hover:text-fg">
            Iniciar sesión
          </Link>
          <ButtonLink to="/register" size="sm">
            Registrarse
          </ButtonLink>
        </>
      }
      mobileActions={
        <>
          <ButtonLink to="/analyzer" size="lg" rightIcon={ArrowRight}>
            Escanear mensaje
          </ButtonLink>
          <div className="grid grid-cols-2 gap-3">
            <ButtonLink to="/login" variant="outline" size="lg">
              Iniciar sesión
            </ButtonLink>
            <ButtonLink to="/register" variant="outline" size="lg">
              Registrarse
            </ButtonLink>
          </div>
        </>
      }
    />
  );
}
