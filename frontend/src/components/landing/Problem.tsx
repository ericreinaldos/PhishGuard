import { useRef } from 'react';
import { PHISHING_TACTICS } from '@/data/content';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { useReveal } from '@/hooks/useReveal';

const STATEMENT =
  'Un mensaje fraudulento no avisa de que lo es. Se parece a tu banco, a tu empresa de mensajería o a alguien de tu trabajo, y te pide que actúes rápido.';

export function Problem() {
  const scope = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  useReveal(scope);

  // La frase se «enciende» palabra a palabra al avanzar el scroll
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-word]',
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: statement.current, start: 'top 80%', end: 'bottom 50%', scrub: true },
          },
        );
      });
    },
    { scope },
  );

  return (
    <section id="el-problema" ref={scope} aria-labelledby="el-problema-title" className="scroll-mt-20 border-t border-line py-section">
      <div className="container-page">
        <h2 id="el-problema-title" className="eyebrow" style={{ fontStretch: '100%' }} data-reveal>
          El problema
        </h2>

        <p
          ref={statement}
          className="mt-10 max-w-[22ch] font-semiwide text-[1.85rem] font-medium leading-[1.12] text-fg sm:max-w-[26ch] sm:text-[2.8rem] lg:text-[3.5rem]"
        >
          {STATEMENT.split(' ').map((word, i) => (
            <span key={i} data-word>
              {word}{' '}
            </span>
          ))}
        </p>

        <div className="mt-24 grid grid-cols-1 gap-10 lg:mt-32 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-reveal className="max-w-xs text-[17px] leading-relaxed text-muted">
              Las técnicas cambian de disfraz, pero son siempre las mismas. Reconocerlas es la mitad del trabajo.
            </p>
          </div>

          <ol className="lg:col-span-8" data-reveal="stagger">
            {PHISHING_TACTICS.map((tactic, i) => (
              <li key={tactic.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 border-t border-line py-8 last:border-b sm:grid-cols-[3rem_1fr_1fr] sm:gap-x-8">
                <span className="pt-2 font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-semiwide text-2xl font-semibold text-fg sm:text-[1.75rem]">{tactic.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{tactic.text}</p>
                </div>
                <p className="col-start-2 self-center sm:col-start-3">
                  <span className="border-b-2 border-accent-strong pb-0.5 font-mono text-[13px] leading-loose text-fg">«{tactic.example}»</span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p data-reveal className="mt-16 max-w-2xl font-semiwide text-xl font-medium text-fg sm:text-2xl lg:ml-[33.33%]">
          PhishGuard busca esas señales por ti y te enseña <span className="text-accent">dónde están</span>.
        </p>
      </div>
    </section>
  );
}
