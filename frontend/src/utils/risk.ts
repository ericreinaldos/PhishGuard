import {
  AlertOctagon,
  AlertTriangle,
  FileText,
  Link2,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { AnalysisType, RiskLevel, SignalCategory } from '@/types/analysis';

interface RiskConfig {
  label: string;
  /** Clases Tailwind para texto, fondo suave y borde. */
  text: string;
  soft: string;
  border: string;
  /** Color sólido para barras y medidores. */
  solid: string;
  /** Color como valor CSS, para SVG. */
  cssColor: string;
  icon: LucideIcon;
}

/** Umbrales: bajo < 30 ≤ medio < 60 ≤ alto. */
export const RISK_THRESHOLDS = { medium: 30, high: 60 } as const;

export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  low: {
    label: 'Bajo',
    text: 'text-safe',
    soft: 'bg-safe/10',
    border: 'border-safe/30',
    solid: 'bg-safe',
    cssColor: 'rgb(var(--safe))',
    icon: ShieldCheck,
  },
  medium: {
    label: 'Medio',
    text: 'text-warning',
    soft: 'bg-warning/10',
    border: 'border-warning/30',
    solid: 'bg-warning',
    cssColor: 'rgb(var(--warning))',
    icon: AlertTriangle,
  },
  high: {
    label: 'Alto',
    text: 'text-danger',
    soft: 'bg-danger/10',
    border: 'border-danger/30',
    solid: 'bg-danger',
    cssColor: 'rgb(var(--danger))',
    icon: AlertOctagon,
  },
};

export const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

export function scoreToLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.high) return 'high';
  if (score >= RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/** Etiquetas cortas por categoría de señal (las del boceto de resultados). */
export const SIGNAL_CATEGORY_LABEL: Record<SignalCategory, string> = {
  urgency: 'Urgencia',
  links: 'Enlaces sospechosos',
  impersonation: 'Suplantación',
  tone: 'Tono',
  credentials: 'Petición de datos',
  attachments: 'Adjuntos',
  domain: 'Dominio',
  authentication: 'Autenticación',
};

export const ANALYSIS_TYPE_CONFIG: Record<AnalysisType, { label: string; icon: LucideIcon }> = {
  message: { label: 'Mensaje', icon: FileText },
  url: { label: 'URL', icon: Link2 },
  headers: { label: 'Cabeceras', icon: Mail },
};
