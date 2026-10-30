/** Modalidades de análisis que ofrece el analizador. */
export type AnalysisType = 'message' | 'url' | 'headers';

/** Niveles de riesgo. Los umbrales viven en utils/risk.ts. */
export type RiskLevel = 'low' | 'medium' | 'high';

export type SignalCategory =
  | 'urgency'
  | 'links'
  | 'impersonation'
  | 'tone'
  | 'credentials'
  | 'attachments'
  | 'domain'
  | 'authentication';

/** Señal detectada por el motor de reglas. */
export interface DetectedSignal {
  id: string;
  /** Identificador de la regla que la disparó, p. ej. "URG-001". */
  ruleId: string;
  category: SignalCategory;
  title: string;
  description: string;
  /** Puntos que la señal suma a la puntuación total. */
  weight: number;
  /** Fragmento del contenido que activó la regla, si aplica. */
  evidence?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
}

/** Petición que el frontend enviará al backend. */
export interface AnalysisRequest {
  type: AnalysisType;
  content: string;
}

/** Resultado completo de un análisis. */
export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  /** Puntuación 0–100. */
  score: number;
  level: RiskLevel;
  verdict: string;
  summary: string;
  input: string;
  signals: DetectedSignal[];
  recommendations: Recommendation[];
  createdAt: string;
  durationMs: number;
  engineVersion: string;
  rulesEvaluated: number;
}

/** Fila resumida para listados (historial, dashboard). */
export interface AnalysisSummary {
  id: string;
  type: AnalysisType;
  preview: string;
  score: number;
  level: RiskLevel;
  createdAt: string;
}
