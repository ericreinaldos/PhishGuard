import type { LoginCredentials, RegisterPayload, User } from '@/types/user';
import { ServiceUnavailableError } from './apiClient';

/**
 * Contrato del servicio de autenticación. No crea sesiones ni guarda datos:
 * cada función indica que la autenticación real está pendiente.
 */

export async function login(_credentials: LoginCredentials): Promise<User> {
  throw new ServiceUnavailableError('Inicio de sesión');
}

export async function register(_payload: RegisterPayload): Promise<User> {
  throw new ServiceUnavailableError('Registro de usuarios');
}

export async function logout(): Promise<void> {
  throw new ServiceUnavailableError('Cierre de sesión');
}
