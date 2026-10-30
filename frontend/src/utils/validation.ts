/** Validaciones de cliente. El backend deberá repetirlas: no son una medida de seguridad. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

export function isValidUrl(value: string): boolean {
  const raw = value.trim();
  if (!raw || /\s/.test(raw)) return false;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

export interface PasswordCheck {
  label: string;
  passed: boolean;
}

export function checkPassword(password: string): PasswordCheck[] {
  return [
    { label: 'Al menos 8 caracteres', passed: password.length >= 8 },
    { label: 'Mayúsculas y minúsculas', passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Al menos un número', passed: /\d/.test(password) },
  ];
}

export const isStrongPassword = (password: string) => checkPassword(password).every((c) => c.passed);

/** Heurística mínima para avisar si lo pegado no parece una cabecera de correo. */
export const looksLikeEmailHeaders = (value: string) =>
  /^(received|from|return-path|authentication-results|message-id|dkim-signature):/im.test(value);
