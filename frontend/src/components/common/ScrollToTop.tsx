import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

/**
 * Gestiona el scroll al navegar:
 * - Con ancla (#seccion): desplaza hasta ella (Lenis o nativo).
 * - Sin ancla: vuelve arriba al instante y, si cambia la página, lleva el foco al contenido.
 * Depende de `key` para que repetir el mismo enlace también desplace.
 * Los cambios de parámetros con `replace` (pestañas del analizador) no mueven la página.
 */
export function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const { scrollTo } = useSmoothScroll();
  const previousPath = useRef(pathname);
  const previousSearch = useRef(search);

  useEffect(() => {
    const pageChanged = previousPath.current !== pathname;
    const searchChanged = previousSearch.current !== search;
    previousPath.current = pathname;
    previousSearch.current = search;

    if (!hash) {
      // Repetir un enlace también es `replace`, pero no cambia los parámetros
      if (!pageChanged && searchChanged && navigationType === 'REPLACE') return;
      scrollTo(0, { immediate: true });
      if (!pageChanged) return;
      // Espera un frame: el menú móvil debe haber liberado `main` antes de recibir el foco
      const id = requestAnimationFrame(() => document.getElementById('contenido')?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(id);
    }
    // Espera un frame para que la página de destino haya pintado su contenido
    const id = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      scrollTo(target);
      // Mueve el foco al destino para que la navegación con teclado continúe ahí
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, search, hash, key, navigationType, scrollTo]);

  return null;
}
