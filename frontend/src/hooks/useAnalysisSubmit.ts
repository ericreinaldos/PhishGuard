import { useCallback, useState } from 'react';
import type { AnalysisRequest, AnalysisResult } from '@/types/analysis';
import { submitAnalysis } from '@/services/analysisService';
import { isServiceUnavailable } from '@/services/apiClient';

export type AnalysisStatus =
  | { state: 'idle' }
  | { state: 'loading'; request: AnalysisRequest }
  | { state: 'pending'; request: AnalysisRequest }
  | { state: 'success'; result: AnalysisResult }
  | { state: 'error'; message: string };

/**
 * Envía una petición al servicio de análisis y expone su estado.
 * Hoy el servicio siempre responde "pendiente de integración"; cuando exista
 * el motor, el estado `success` empezará a recibir resultados sin cambiar la UI.
 */
export function useAnalysisSubmit() {
  const [status, setStatus] = useState<AnalysisStatus>({ state: 'idle' });

  const submit = useCallback(async (request: AnalysisRequest) => {
    setStatus({ state: 'loading', request });
    try {
      const result = await submitAnalysis(request);
      setStatus({ state: 'success', result });
    } catch (error) {
      if (isServiceUnavailable(error)) {
        setStatus({ state: 'pending', request });
      } else {
        setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }
  }, []);

  const reset = useCallback(() => setStatus({ state: 'idle' }), []);

  return { status, submit, reset };
}
