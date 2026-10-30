import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Check, KeyRound, User, UserPlus } from 'lucide-react';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { register } from '@/services/authService';
import { isServiceUnavailable } from '@/services/apiClient';
import { checkPassword, isStrongPassword, isValidEmail } from '@/utils/validation';
import { cn } from '@/utils/cn';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
  acceptTerms: boolean;
}

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(v: FormValues): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = 'Introduce tu nombre.';
  if (!isValidEmail(v.email)) errors.email = 'Introduce un correo electrónico válido.';
  if (!isStrongPassword(v.password)) errors.password = 'La contraseña no cumple los requisitos.';
  if (!v.confirm) errors.confirm = 'Repite la contraseña.';
  else if (v.confirm !== v.password) errors.confirm = 'Las contraseñas no coinciden.';
  if (!v.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos para continuar.';
  return errors;
}

export function RegisterPage() {
  useDocumentTitle('Crear cuenta');
  const { notifyPending } = useToast();
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '', confirm: '', acceptTerms: false });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setNotice(false);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password, acceptTerms: values.acceptTerms });
    } catch (error) {
      if (isServiceUnavailable(error)) setNotice(true);
    } finally {
      setSubmitting(false);
    }
  };

  const checks = checkPassword(values.password);

  return (
    <>
      <p className="eyebrow">Registro</p>
      <h1 className="mt-5 font-semiwide text-[2.2rem] font-semibold uppercase leading-[1] text-fg sm:text-[2.6rem]">
        Crea tu <span className="text-accent-strong">cuenta</span>
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">Guarda tu historial y configura tus preferencias de análisis.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input id="name" label="Nombre y apellidos" autoComplete="name" placeholder="Ana García" icon={User} value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <Input id="reg-email" label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" icon={AtSign} value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
        <div>
          <PasswordInput id="reg-password" label="Contraseña" autoComplete="new-password" icon={KeyRound} value={values.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Requisitos de la contraseña">
            {checks.map((c) => (
              <li key={c.label} className={cn('flex items-center gap-1.5 text-xs transition-colors', c.passed ? 'text-safe' : 'text-subtle')}>
                <Check className={cn('h-3.5 w-3.5', !c.passed && 'opacity-40')} aria-hidden />
                {c.label}
                <span className="sr-only">{c.passed ? '(cumplido)' : '(pendiente)'}</span>
              </li>
            ))}
          </ul>
        </div>
        <PasswordInput id="reg-confirm" label="Repetir contraseña" autoComplete="new-password" icon={KeyRound} value={values.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} />
        <Checkbox
          id="terms"
          checked={values.acceptTerms}
          onChange={(e) => set('acceptTerms', e.target.checked)}
          error={errors.acceptTerms}
          label={
            <>
              Acepto los{' '}
              <button type="button" onClick={() => notifyPending('La página de términos de uso')} className="text-accent hover:underline">
                términos de uso
              </button>{' '}
              y la{' '}
              <button type="button" onClick={() => notifyPending('La política de privacidad')} className="text-accent hover:underline">
                política de privacidad
              </button>
              .
            </>
          }
        />

        {notice && (
          <Alert tone="info" title="Registro pendiente de integración">
            Los datos son válidos, pero todavía no hay backend: no se ha creado ninguna cuenta ni se ha guardado información.
          </Alert>
        )}

        <Button type="submit" size="lg" fullWidth leftIcon={UserPlus} loading={submitting}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-strong">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
