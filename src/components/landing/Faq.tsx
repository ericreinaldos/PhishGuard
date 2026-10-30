import { useRef } from 'react';
import { AccordionItem } from '@/components/common/Accordion';
import { FAQ_ITEMS } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';

export function Faq() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section id="faq" ref={scope} aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line bg-surface/40 py-section">
      <div className="container-page grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow" data-reveal>
              Preguntas frecuentes
            </p>
            <h2 id="faq-title" data-reveal className="mt-6 font-semiwide text-[2.1rem] font-semibold uppercase leading-[1] text-fg sm:text-[3rem]">
              Lo que suele <span className="text-accent-strong">preguntarse</span>
            </h2>
          </div>
        </div>
        <div className="border-t border-line lg:col-span-8" data-reveal>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={item.q} title={item.q} index={i + 1} defaultOpen={i === 0}>
              {item.a}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
