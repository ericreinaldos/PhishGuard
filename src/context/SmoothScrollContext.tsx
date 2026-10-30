import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;
  /** Desplaza a un elemento o posición usando Lenis si está activo, o el scroll nativo si no. */
  scrollTo: (target: HTMLElement | number, options?: { immediate?: boolean }) => void;
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

/** Altura de la barra de navegación fija, para que las anclas no queden tapadas. */
export const NAV_OFFSET = 72;

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenisState] = useState<Lenis | null>(null);
  // Referencia síncrona: al desmontar la zona pública se anula antes de que otros efectos
  // intenten desplazar, así nunca se llama a una instancia ya destruida.
  const lenisRef = useRef<Lenis | null>(null);

  const setLenis = useCallback((instance: Lenis | null) => {
    lenisRef.current = instance;
    setLenisState(instance);
  }, []);

  const scrollTo = useCallback<SmoothScrollContextValue['scrollTo']>(
    (target, options) => {
      const immediate = options?.immediate ?? false;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -NAV_OFFSET, immediate, force: true });
        return;
      }
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'auto' });
      } else {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior: immediate || reduce ? 'auto' : 'smooth' });
      }
    },
    [],
  );

  const value = useMemo(() => ({ lenis, setLenis, scrollTo }), [lenis, setLenis, scrollTo]);
  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

/**
 * Activa Lenis mientras el componente que lo llama esté montado.
 * Se usa solo en las páginas públicas: las páginas de trabajo mantienen el scroll nativo.
 * Con movimiento reducido no se crea: el scroll queda 100 % nativo.
 */
export function useLenis(setLenis: SmoothScrollContextValue['setLenis']) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // En táctil se respeta el scroll nativo del dispositivo
      syncTouch: false,
    });

    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      // stop() reinicia el estado interno de forma síncrona; sin él, un scroll en curso
      // vuelve a añadir la clase .lenis al <html> después de destroy().
      instance.stop();
      instance.destroy();
      setLenis(null);
    };
  }, [reduced, setLenis]);
}
