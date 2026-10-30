import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ScanSearch } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Rule } from '@/components/common/Rule';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { HeroSpecimen } from './HeroSpecimen';

const LETTERS = 'PHISHGUARD'.split('');

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Entrada: nombre → regla → titular → texto y botones → composición
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from('[data-hero-letter]', { yPercent: 105, duration: 1.1, stagger: 0.04 })
          .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.1 }, '-=0.8')
          .from('[data-hero-line]', { yPercent: 105, duration: 0.9, stagger: 0.08 }, '-=0.85')
          .from('[data-hero-fade]', { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.07 }, '-=0.55')
          .from('[data-specimen]', { autoAlpha: 0, y: 28, duration: 1 }, '-=0.75')
          .from('[data-mark]', { scaleX: 0, transformOrigin: 'left center', duration: 0.45, stagger: 0.18, ease: 'power2.out' }, '-=0.35')
          .from('[data-note]', { autoAlpha: 0, x: -6, duration: 0.45, stagger: 0.12 }, '<0.1');

        // Al salir del hero, el nombre se desplaza algo más despacio que el contenido
        gsap.to('[data-wordmark]', {
          yPercent: -22,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative flex min-h-[100svh] flex-col overflow-hidden pb-8 pt-24 sm:pt-28">
      <div className="container-page flex flex-1 flex-col">
        <div data-hero-fade className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle sm:text-[11px]">
          <span>Detección de phishing basada en reglas</span>
          <span className="hidden sm:inline">Proyecto en desarrollo</span>
        </div>

        {/*
          Nombre protagonista, centrado respecto al área visible: el contenedor es simétrico y el
          flex centra las letras; cuando el nombre es más ancho que el contenedor, el desbordamiento
          se reparte por igual a ambos lados y la sección (overflow-hidden) lo recorta sin scroll.
          El interletraje negativo va en márgenes entre letras para no dejar hueco tras la última.
          Tamaño: escala lineal con el ancho de la ventana, reducida un 15 % (× 0,85) sobre la versión
          que ocupaba ≈101 % del ancho en escritorio y ≈96 % en móvil.
        */}
        <p
          data-wordmark
          aria-label="PhishGuard"
          className="mt-5 flex select-none justify-center whitespace-nowrap font-wide font-extrabold uppercase leading-[0.86] text-fg"
          // padding-right compensa la diferencia de márgenes laterales de la P y la D
          style={{ fontSize: 'calc(clamp(2.1rem, calc(12.46vw - 0.18rem), 22rem) * 0.85)', paddingRight: '0.03em' }}
        >
          {LETTERS.map((letter, i) => (
            <span key={i} className="-mr-[0.05em] inline-block shrink-0 overflow-hidden pb-[0.04em] last:mr-0" aria-hidden>
              <span data-hero-letter className="inline-block">
                {letter}
              </span>
            </span>
          ))}
        </p>

        <Rule data-hero-rule="" className="mt-6 sm:mt-8" />

        <div className="mt-10 grid flex-1 grid-cols-1 gap-12 sm:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col lg:col-span-5">
            <h1 className="font-semiwide text-[2.35rem] font-semibold uppercase leading-[0.98] text-fg sm:text-[3.4rem] lg:text-[3.15rem] xl:text-[3.6rem]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">
                  ¿Es de fiar
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block text-accent-strong">
                  ese mensaje?
                </span>
              </span>
            </h1>
            <p data-hero-fade className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
              Pega un correo, un SMS o un enlace. PhishGuard busca las señales típicas del phishing y te enseña dónde están, antes de que
              respondas o hagas clic.
            </p>
            <div data-hero-fade className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/analyzer" size="lg" leftIcon={ScanSearch}>
                Escanear mensaje
              </ButtonLink>
              <ButtonLink to="/#como-funciona" size="lg" variant="outline">
                ¿Cómo funcionamos?
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-8">
            <HeroSpecimen />
          </div>
        </div>

        <Link
          to="/#el-problema"
          data-hero-fade
          className="group mt-14 hidden items-center gap-4 self-start font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-fg sm:inline-flex"
        >
          <span className="relative block h-10 w-px overflow-hidden bg-line" aria-hidden>
            <span className="absolute inset-0 animate-scroll-cue bg-accent" />
          </span>
          Sigue bajando
          <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
