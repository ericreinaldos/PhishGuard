/**
 * Punto único de configuración para el futuro backend en Python.
 *
 * Todavía no hay servidor: ningún servicio realiza peticiones. Cuando exista,
 * basta con implementar `request` (fetch + token) y sustituir los
 * `throw new ServiceUnavailableError(...)` de cada servicio por llamadas reales.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** Indica que la funcionalidad depende de un backend que aún no está integrado. */
export class ServiceUnavailableError extends Error {
  constructor(feature: string) {
    super(`${feature}: pendiente de integración con el backend.`);
    this.name = 'ServiceUnavailableError';
  }
}

export const isServiceUnavailable = (error: unknown): error is ServiceUnavailableError =>
  error instanceof ServiceUnavailableError;
