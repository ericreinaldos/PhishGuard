import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { setUserReducedMotion } from '@/lib/gsap';
import { preferencesService } from '@/services/preferencesService';
import type { Preferences } from '@/types/preferences';

export interface PreferencesContextValue {
  preferences: Preferences;
  /** Aplica el cambio al momento y lo guarda; si falla, recupera el valor anterior. */
  updatePreferences: (patch: Partial<Preferences>) => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast();
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const cached = preferencesService.getCached();
    // Antes del primer render: las animaciones consultan este valor al montarse
    setUserReducedMotion(cached.reduceMotion);
    return cached;
  });
  const current = useRef(preferences);

  const apply = useCallback((next: Preferences) => {
    current.current = next;
    setUserReducedMotion(next.reduceMotion);
    setPreferences(next);
  }, []);

  useEffect(() => {
    let active = true;
    preferencesService
      .load()
      .then((loaded) => active && apply(loaded))
      .catch(() => undefined); // Se mantiene el último valor conocido
    return () => {
      active = false;
    };
  }, [apply]);

  const updatePreferences = useCallback<PreferencesContextValue['updatePreferences']>(
    (patch) => {
      const previous = current.current;
      const next = { ...previous, ...patch };
      apply(next);
      preferencesService.save(next).catch(() => {
        apply(previous);
        notify({ tone: 'warning', title: 'No se ha podido guardar el cambio', description: 'Se ha recuperado el valor anterior. Inténtalo de nuevo.' });
      });
    },
    [apply, notify],
  );

  const value = useMemo(() => ({ preferences, updatePreferences }), [preferences, updatePreferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
