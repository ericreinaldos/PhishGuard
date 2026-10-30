import type { AnalysisRequest, AnalysisResult, AnalysisSummary } from '@/types/analysis';
import { ServiceUnavailableError } from './apiClient';

/**
 * Contrato del servicio de análisis. Las firmas son las definitivas; el cuerpo
 * se sustituirá por llamadas al motor de reglas (p. ej. POST /analyses).
 */

export async function submitAnalysis(_request: AnalysisRequest): Promise<AnalysisResult> {
  throw new ServiceUnavailableError('Motor de análisis');
}

export async function getAnalysis(_id: string): Promise<AnalysisResult> {
  throw new ServiceUnavailableError('Detalle de análisis');
}

export async function listAnalyses(): Promise<AnalysisSummary[]> {
  throw new ServiceUnavailableError('Historial de análisis');
}
