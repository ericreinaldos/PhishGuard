import { Activity, AlertOctagon, ScanSearch, ShieldCheck, Timer, Users } from 'lucide-react';
import type {
  ActivityEvent,
  RiskDistributionEntry,
  StatMetric,
  TimeSeriesPoint,
  TypeDistributionEntry,
} from '@/types/stats';

/*
 * DEMO: cifras ficticias para el dashboard y el panel de administración.
 * No representan usuarios ni actividad reales.
 */

export const DEMO_DASHBOARD_METRICS: StatMetric[] = [
  { id: 'total', label: 'Análisis realizados', value: '128', delta: '+14', trend: 'up', icon: ScanSearch },
  { id: 'high', label: 'Riesgo alto detectado', value: '23', delta: '+3', trend: 'up', icon: AlertOctagon },
  { id: 'safe', label: 'Mensajes sin señales', value: '71', delta: '+9', trend: 'up', icon: ShieldCheck },
];

export const DEMO_DASHBOARD_RISK: RiskDistributionEntry[] = [
  { level: 'low', count: 71 },
  { level: 'medium', count: 34 },
  { level: 'high', count: 23 },
];

export const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: 'a1', title: 'Mensaje analizado', detail: 'Suspensión de cuenta bancaria', createdAt: '2026-10-28T09:14:00Z', level: 'high' },
  { id: 'a2', title: 'URL analizada', detail: 'secure-banco-verificacion.co', createdAt: '2026-10-27T17:42:00Z', level: 'high' },
  { id: 'a3', title: 'Cabeceras analizadas', detail: 'Aviso de envío de paquetería', createdAt: '2026-10-27T11:05:00Z', level: 'medium' },
  { id: 'a4', title: 'Preferencias actualizadas', detail: 'Notificaciones por correo', createdAt: '2026-10-26T18:00:00Z' },
];

export const DEMO_ADMIN_METRICS: StatMetric[] = [
  { id: 'users', label: 'Usuarios registrados', value: '1.284', delta: '+6 %', trend: 'up', icon: Users },
  { id: 'analyses', label: 'Análisis (7 días)', value: '9.412', delta: '+11 %', trend: 'up', icon: Activity },
  { id: 'high', label: 'Riesgo alto (7 días)', value: '1.937', delta: '−2 %', trend: 'down', icon: AlertOctagon },
  { id: 'latency', label: 'Tiempo medio', value: '212 ms', delta: '0 %', trend: 'flat', icon: Timer },
];

export const DEMO_ADMIN_DAILY: TimeSeriesPoint[] = [
  { label: 'Lun', value: 1180 },
  { label: 'Mar', value: 1424 },
  { label: 'Mié', value: 1376 },
  { label: 'Jue', value: 1512 },
  { label: 'Vie', value: 1690 },
  { label: 'Sáb', value: 1032 },
  { label: 'Dom', value: 1198 },
];

export const DEMO_ADMIN_RISK: RiskDistributionEntry[] = [
  { level: 'low', count: 5214 },
  { level: 'medium', count: 2261 },
  { level: 'high', count: 1937 },
];

export const DEMO_ADMIN_TYPES: TypeDistributionEntry[] = [
  { type: 'message', count: 5480 },
  { type: 'url', count: 3108 },
  { type: 'headers', count: 824 },
];

export const DEMO_ADMIN_EVENTS: ActivityEvent[] = [
  { id: 'e1', title: 'Pico de análisis de URL', detail: 'Campaña de SMS de paquetería', createdAt: '2026-10-28T08:40:00Z', level: 'high' },
  { id: 'e2', title: 'Nuevo registro', detail: 'usuario-ficticio-1284', createdAt: '2026-10-28T08:12:00Z' },
  { id: 'e3', title: 'Regla actualizada', detail: 'LNK-004 · dominios similares', createdAt: '2026-10-27T19:30:00Z' },
  { id: 'e4', title: 'Cabeceras con DKIM fallido', detail: '37 análisis en 1 hora', createdAt: '2026-10-27T16:05:00Z', level: 'medium' },
  { id: 'e5', title: 'Nuevo registro', detail: 'usuario-ficticio-1283', createdAt: '2026-10-27T12:48:00Z' },
];
