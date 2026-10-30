import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, KeyRound, LogIn } from 'lucide-react';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { login } from '@/services/authService';
import { isServiceUnavailable } from '@/services/apiClient';
import type { LoginCredentials } from '@/types/user';
import { isValidEmail } from '@/utils/validation';

type Errors = Partial<Record<'email' | 'password', string>>;

function validate(values: LoginCredentials): Errors {
  const errors: Errors = {};
  if (!values.email.trim()) errors.email = 'Introduce tu correo electrónico.';
  else if (!isValidEmail(values.email)) errors.email = 'El formato del correo no es válido.';
  if (!values.password) errors.password = 'Introduce tu contraseña.';
  return errors;
}

export function LoginPage() {
  useDocumentTitle('Iniciar sesión');
  const { notifyPending } = useToast();
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof LoginCredentials>(key: K, value: LoginCredentials[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setNotice(null);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login(values);
    } catch (error) {
      if (isServiceUnavailable(error)) {
        setNotice('El formulario es válido, pero la autenticación aún no está conectada. No se ha enviado ni guardado ningún dato y no se ha iniciado sesión.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="eyebrow">Acceso</p>
      <h1 className="mt-5 font-semiwide text-[2.2rem] font-semibold uppercase leading-[1] text-fg sm:text-[2.6rem]">
        Bienvenido <span className="text-accent-strong">de nuevo</span>
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">Inicia sesión para consultar tu historial de análisis.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          icon={AtSign}
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <PasswordInput
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={KeyRound}
          value={values.password}
          onChange={(e) => set('password', e.target.value)}
          error={errors.password}
          aside={
            <button type="button" onClick={() => notifyPending('La recuperación de contraseña')} className="rounded text-xs text-accent hover:text-accent-strong">
              ¿Olvidaste tu contraseña?
            </button>
          }
        />
        <Checkbox id="remember" label="Recordarme en este dispositivo" checked={values.remember} onChange={(e) => set('remember', e.target.checked)} />

        {notice && <Alert tone="info" title="Autenticación pendiente de integración">{notice}</Alert>}

        <Button type="submit" size="lg" fullWidth leftIcon={LogIn} loading={submitting}>
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-accent hover:text-accent-strong">
          Regístrate
        </Link>
      </p>
    </>
  );
}
