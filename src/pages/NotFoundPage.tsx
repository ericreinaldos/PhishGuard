import { useLocation } from 'react-router-dom';
import { ArrowLeft, ScanSearch } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <div className="container-page flex h-16 items-center">
        <Logo />
      </div>
      <main className="container-page flex flex-1 flex-col justify-center py-16">
        <p
          className="select-none whitespace-nowrap font-wide font-bold leading-[0.8] tracking-[-0.04em] text-fg"
          style={{ fontSize: 'min(34vw, 20rem)' }}
          aria-hidden
        >
          4<span className="text-accent-strong">0</span>4
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-line pt-8 lg:grid-cols-12">
          <h1 className="font-semiwide text-[2rem] font-semibold uppercase leading-[1] text-fg sm:text-[2.6rem] lg:col-span-6">
            Este enlace no lleva a ninguna parte
          </h1>
          <div className="lg:col-span-6">
            <p className="max-w-md text-[17px] leading-relaxed text-muted">
              No existe ninguna página en <code className="break-all rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-fg">{pathname}</code>.
              Ya que estás aquí: desconfía de los enlaces que no esperabas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/" variant="outline" leftIcon={ArrowLeft}>
                Volver al inicio
              </ButtonLink>
              <ButtonLink to="/analyzer" leftIcon={ScanSearch}>
                Ir al analizador
              </ButtonLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
