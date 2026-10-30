import type { AnalysisType } from '@/types/analysis';
import { ANALYSIS_TYPE_CONFIG } from '@/utils/risk';

export function TypeLabel({ type }: { type: AnalysisType }) {
  const { label, icon: Icon } = ANALYSIS_TYPE_CONFIG[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
