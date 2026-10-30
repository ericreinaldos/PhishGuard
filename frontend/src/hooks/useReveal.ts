import type { RefObject } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

/**
 * Revela al entrar en pantalla los elementos con `data-reveal` dentro de `scope`.
 * - `data-reveal-delay="0.1"` retrasa un elemento concreto.
 * - `data-reveal="stagger"` revela sus hijos directos de forma escalonada.
 *
 * El contenido es visible por defecto: el estado inicial solo lo aplica GSAP cuando
 * el usuario no ha pedido reducir el movimiento. useGSAP revierte todo al desmontar,
 * así que no quedan disparadores duplicados al cambiar de ruta.
 */
export function useReveal(scope: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          const stagger = el.dataset.reveal === 'stagger';
          const targets = stagger ? Array.from(el.children) : el;
          gsap.from(targets, {
            autoAlpha: 0,
            y: 28,
            duration: 0.9,
            delay: Number(el.dataset.revealDelay ?? 0),
            stagger: stagger ? 0.08 : 0,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      });
    },
    { scope },
  );
}
