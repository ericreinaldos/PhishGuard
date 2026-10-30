export interface NavItem {
  label: string;
  to: string;
}

/** Navegación pública: anclas de la landing y acceso al analizador. */
export const PUBLIC_NAV: readonly NavItem[] = [
  { label: 'El problema', to: '/#el-problema' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Analizador', to: '/analyzer' },
  { label: 'Preguntas', to: '/#faq' },
];

/** Secciones de la aplicación. Perfil, notificaciones y cierre de sesión están en el menú de cuenta. */
export const APP_NAV: readonly NavItem[] = [
  { label: 'Panel', to: '/dashboard' },
  { label: 'Analizador', to: '/analyzer' },
  { label: 'Resultados', to: '/results' },
  { label: 'Historial', to: '/history' },
  { label: 'Administración', to: '/admin' },
];
