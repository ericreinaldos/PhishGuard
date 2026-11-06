import type { AnalysisRequest } from '@/types/analysis';

export interface AnalyzerFormProps {
  onSubmit: (request: AnalysisRequest) => void;
  busy: boolean;
  /** Borrador de esta modalidad; lo conserva la página al cambiar de pestaña. */
  value: string;
  onValueChange: (value: string) => void;
}
