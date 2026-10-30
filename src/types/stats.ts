import type { LucideIcon } from 'lucide-react';
import type { AnalysisType, RiskLevel } from './analysis';

export interface StatMetric {
  id: string;
  label: string;
  value: string;
  /** Variación respecto al periodo anterior, ya formateada (p. ej. "+12 %"). */
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: LucideIcon;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface RiskDistributionEntry {
  level: RiskLevel;
  count: number;
}

export interface TypeDistributionEntry {
  type: AnalysisType;
  count: number;
}

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  level?: RiskLevel;
}
