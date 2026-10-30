import type { AnalysisRequest } from '@/types/analysis';

export interface AnalyzerFormProps {
  onSubmit: (request: AnalysisRequest) => void;
  busy: boolean;
}
