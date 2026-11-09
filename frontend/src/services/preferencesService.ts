import { DEFAULT_PREFERENCES, type Preferences } from '@/types/preferences';

/**
 * Único punto de acceso a las preferencias. La interfaz no sabe dónde se guardan:
 * para usar el backend basta con implementar `PreferencesStore` contra la API
 * y sustituir `preferencesService`.
 */
export interface PreferencesStore {
  /** Último valor conocido, disponible al instante para evitar parpadeos al arrancar. */
  getCached(): Preferences;
  load(): Promise<Preferences>;
  save(preferences: Preferences): Promise<Preferences>;
}

const STORAGE_KEY = 'phishguard.preferences';

/** Conserva solo las claves conocidas con el tipo correcto; el resto toma su valor por defecto. */
function sanitize(value: unknown): Preferences {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const clean = { ...DEFAULT_PREFERENCES };
  for (const key of Object.keys(DEFAULT_PREFERENCES) as Array<keyof Preferences>) {
    if (typeof source[key] === 'boolean') clean[key] = source[key];
  }
  return clean;
}

function createLocalStore(): PreferencesStore {
  // Si el almacenamiento está bloqueado, las preferencias duran mientras la página siga abierta
  let cached: Preferences | null = null;

  const read = (): Preferences => {
    if (cached) return cached;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      cached = raw ? sanitize(JSON.parse(raw)) : { ...DEFAULT_PREFERENCES };
    } catch {
      cached = { ...DEFAULT_PREFERENCES };
    }
    return cached;
  };

  return {
    getCached: read,
    load: async () => read(),
    save: async (preferences) => {
      cached = sanitize(preferences);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
      } catch {
        // Sin almacenamiento disponible se mantiene el valor en memoria
      }
      return cached;
    },
  };
}

export const preferencesService: PreferencesStore = createLocalStore();
