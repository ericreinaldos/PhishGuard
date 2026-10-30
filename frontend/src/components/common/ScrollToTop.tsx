import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

/**
 * Gestiona el scroll al navegar:
 * - Con ancla (#seccion): desplaza hasta ella (Lenis o nativo).
 * - Sin ancla: vuelve arriba al instante.
 * Depende de `key` para que repetir el mismo enlace también desplace.
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (!hash) {
      scrollTo(0, { immediate: true });
      return;
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
  }, [pathname, hash, key, scrollTo]);

  return null;
}
