import { useRef } from 'react';
import { ScanSearch } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { useReveal } from '@/hooks/useReveal';

export function FinalCta() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section ref={scope} aria-labelledby="cta-title" className="border-t border-line py-section">
      <div className="container-page">
        <h2
          id="cta-title"
          data-reveal
          className="max-w-[14ch] font-wide text-[2.6rem] font-bold uppercase leading-[0.95] tracking-[-0.025em] text-fg sm:text-[4.5rem] lg:text-[6.5rem]"
        >
          ¿Te ha llegado algo <span className="text-accent-strong">raro?</span>
        </h2>
        <div className="mt-12 flex flex-col gap-8 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <p className="max-w-md text-[17px] leading-relaxed text-muted">Antes de responder, pagar o hacer clic, compruébalo.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/analyzer" size="lg" leftIcon={ScanSearch}>
              Escanear mensaje
            </ButtonLink>
            <ButtonLink to="/register" size="lg" variant="outline">
              Crear cuenta
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
