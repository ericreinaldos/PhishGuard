import type { User } from '@/types/user';

/**
 * DEMO: usuario ficticio para rellenar la interfaz mientras no existe
 * autenticación. Se sustituirá por el usuario devuelto por el backend.
 */
export const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Usuario de demostración',
  email: 'demo@phishguard.local',
  role: 'admin',
  createdAt: '2026-09-01T09:00:00Z',
};
