import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/** Punto único de registro de plugins de GSAP. Importa siempre desde aquí. */
gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });

// Las fuentes web cambian la altura del contenido: recalcula los disparadores al cargarlas.
if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/** Media query que envuelve toda animación con movimiento. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/**
 * Movimiento de las páginas de la app (la portada no depende de esto).
 * - `subtle`: cabecera con un fundido breve y secciones visibles desde el inicio.
 * - `full`: entrada completa de la cabecera y revelado de cada sección al hacer scroll.
 * Cambiar este valor es lo único necesario para volver a la versión anterior.
 */
export const APP_MOTION: 'full' | 'subtle' = 'subtle';

export { gsap, ScrollTrigger, useGSAP };
