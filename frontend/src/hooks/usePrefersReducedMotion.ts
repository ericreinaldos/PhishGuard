import { useEffect, useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Movimiento reducido por el sistema o por la preferencia del usuario. */
export function usePrefersReducedMotion() {
  const { preferences } = usePreferences();
  const [systemReduced, setSystemReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return systemReduced || preferences.reduceMotion;
}
