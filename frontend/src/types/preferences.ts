/** Preferencias del usuario: las visuales se aplican ya; las de privacidad, cuando exista el backend. */
export interface Preferences {
  reduceMotion: boolean;
  compactTables: boolean;
  showTips: boolean;
  saveHistory: boolean;
  storeContent: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  reduceMotion: false,
  compactTables: false,
  showTips: true,
  saveHistory: true,
  storeContent: false,
};
