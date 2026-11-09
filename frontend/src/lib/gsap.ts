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

const MOTION_ALLOWED = '(prefers-reduced-motion: no-preference)';
/** Nunca coincide: desactiva las animaciones aunque se combine con otras condiciones. */
const MOTION_DISABLED = '(max-width: 0px)';

/**
 * Media query que envuelve toda animación con movimiento.
 * Tiene en cuenta el sistema y la preferencia «Reducir animaciones»; las páginas la leen al montarse.
 */
export let MOTION_OK = MOTION_ALLOWED;

let userReducedMotion = false;

/** Aplica la preferencia del usuario a GSAP y, mediante un atributo en <html>, al CSS. */
export function setUserReducedMotion(reduced: boolean) {
  userReducedMotion = reduced;
  MOTION_OK = reduced ? MOTION_DISABLED : MOTION_ALLOWED;
  document.documentElement.toggleAttribute('data-reduce-motion', reduced);
}

/** Indica si no debe haber movimiento, por el sistema o por la preferencia del usuario. */
export const isMotionReduced = () => userReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Movimiento de las páginas de la app (la portada no depende de esto).
 * - `subtle`: cabecera con un fundido breve y secciones visibles desde el inicio.
 * - `full`: entrada completa de la cabecera y revelado de cada sección al hacer scroll.
 * Cambiar este valor es lo único necesario para volver a la versión anterior.
 */
export const APP_MOTION: 'full' | 'subtle' = 'subtle';

export { gsap, ScrollTrigger, useGSAP };
