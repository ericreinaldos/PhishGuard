import type { AnalysisSummary } from '@/types/analysis';

/**
 * DEMO: análisis ficticios para mostrar el diseño de tablas y listados.
 * No proceden de ningún usuario ni de ningún análisis real.
 */
export const DEMO_ANALYSES: AnalysisSummary[] = [
  {
    id: 'demo-1042',
    type: 'message',
    preview: 'Su cuenta ha sido suspendida. Verifique sus datos en las próximas 24 horas…',
    score: 90,
    level: 'high',
    createdAt: '2026-10-28T09:14:00Z',
  },
  {
    id: 'demo-1041',
    type: 'url',
    preview: 'http://secure-banco-verificacion.co/login',
    score: 78,
    level: 'high',
    createdAt: '2026-10-27T17:42:00Z',
  },
  {
    id: 'demo-1040',
    type: 'headers',
    preview: 'From: "Soporte Correos" <avisos@correos-envios.net>',
    score: 46,
    level: 'medium',
    createdAt: '2026-10-27T11:05:00Z',
  },
  {
    id: 'demo-1039',
    type: 'message',
    preview: 'Hola, te paso el acta de la reunión del martes. Un saludo.',
    score: 6,
    level: 'low',
    createdAt: '2026-10-26T15:30:00Z',
  },
  {
    id: 'demo-1038',
    type: 'url',
    preview: 'https://www.agenciatributaria.gob.es',
    score: 4,
    level: 'low',
    createdAt: '2026-10-25T08:51:00Z',
  },
  {
    id: 'demo-1037',
    type: 'message',
    preview: 'Tu paquete está retenido. Paga 1,99 € de tasas aduaneras aquí…',
    score: 64,
    level: 'high',
    createdAt: '2026-10-24T19:20:00Z',
  },
  {
    id: 'demo-1036',
    type: 'headers',
    preview: 'From: notificaciones@empresa-ejemplo.es (SPF pass, DKIM pass)',
    score: 12,
    level: 'low',
    createdAt: '2026-10-23T10:02:00Z',
  },
  {
    id: 'demo-1035',
    type: 'url',
    preview: 'https://bit.ly/3xFake-premio',
    score: 38,
    level: 'medium',
    createdAt: '2026-10-22T13:47:00Z',
  },
];
