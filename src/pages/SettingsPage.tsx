import { useState, type FormEvent } from 'react';
import { AtSign, KeyRound, LogOut, Save, Trash2, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Section } from '@/components/common/Section';
import { DemoTag } from '@/components/common/DemoNotice';
import { DEMO_USER } from '@/data/demoUser';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { useVisualLogout } from '@/hooks/useVisualLogout';
import { formatDate } from '@/utils/format';
import { isValidEmail } from '@/utils/validation';

export function SettingsPage() {
  useDocumentTitle('Configuración');
  const { notifyPending } = useToast();
  const logout = useVisualLogout();

  const [profile, setProfile] = useState({ name: DEMO_USER.name, email: DEMO_USER.email });
  const [emailError, setEmailError] = useState<string>();
  const [prefs, setPrefs] = useState({ reduceMotion: false, compactTables: false, showTips: true });
  const [privacy, setPrivacy] = useState({ saveHistory: true, storeContent: false });

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(profile.email)) {
      setEmailError('Introduce un correo electrónico válido.');
      return;
    }
    setEmailError(undefined);
    notifyPending('Guardar el perfil');
  };

  return (
    <>
      <PageHeader
        eyebrow="Cuenta"
        title={
          <>
            Perfil y <span className="text-accent-strong">configuración</span>
          </>
        }
        description="Gestiona tu información, tus preferencias y tu privacidad."
      />

      <Section index={1} title="Perfil" description="Información básica asociada a tu cuenta.">
        <form onSubmit={saveProfile} noValidate className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-strong font-semiwide text-lg font-semibold text-white">
              {profile.name.charAt(0).toUpperCase() || '?'}
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                {DEMO_USER.name} <DemoTag />
              </p>
              <p className="text-xs text-subtle">Miembro desde {formatDate(DEMO_USER.createdAt)}</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="profile-name" label="Nombre" icon={User} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            <Input
              id="profile-email"
              label="Correo electrónico"
              type="email"
              icon={AtSign}
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              error={emailError}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" leftIcon={Save}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Section>

      <Section index={2} title="Preferencias visuales" description="Ajusta cómo se muestra la aplicación.">
        <div className="flex items-center justify-between gap-4 pb-3">
          <div>
            <p className="text-sm font-medium text-fg">Tema</p>
            <p className="mt-0.5 text-sm text-muted">PhishGuard usa un tema oscuro.</p>
          </div>
          <Badge tone="neutral">Oscuro</Badge>
        </div>
        <div className="divide-y divide-line border-t border-line">
          <Switch id="pref-motion" label="Reducir animaciones" description="Desactiva transiciones y efectos de movimiento." checked={prefs.reduceMotion} onChange={(v) => setPrefs((p) => ({ ...p, reduceMotion: v }))} />
          <Switch id="pref-compact" label="Tablas compactas" description="Muestra más filas en el historial." checked={prefs.compactTables} onChange={(v) => setPrefs((p) => ({ ...p, compactTables: v }))} />
          <Switch id="pref-tips" label="Consejos en el analizador" description="Muestra el panel de ayuda junto al formulario." checked={prefs.showTips} onChange={(v) => setPrefs((p) => ({ ...p, showTips: v }))} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" leftIcon={Save} onClick={() => notifyPending('Guardar las preferencias')}>
            Guardar preferencias
          </Button>
        </div>
      </Section>

      <Section index={3} title="Privacidad" description="Decide qué se conserva de tus análisis.">
        <div className="divide-y divide-line">
          <Switch id="priv-history" label="Guardar historial" description="Conserva la puntuación y el veredicto de cada análisis." checked={privacy.saveHistory} onChange={(v) => setPrivacy((p) => ({ ...p, saveHistory: v }))} />
          <Switch id="priv-content" label="Guardar el contenido analizado" description="Si está desactivado, solo se guarda el resultado, nunca el texto." checked={privacy.storeContent} onChange={(v) => setPrivacy((p) => ({ ...p, storeContent: v }))} />
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" leftIcon={Trash2} onClick={() => notifyPending('Borrar el historial')}>
            Borrar historial
          </Button>
          <Button variant="outline" leftIcon={Save} onClick={() => notifyPending('Guardar la configuración de privacidad')}>
            Guardar
          </Button>
        </div>
      </Section>

      <Section index={4} title="Cuenta" description="Seguridad y opciones de la cuenta.">
        <div className="divide-y divide-line">
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-fg">Contraseña</p>
              <p className="text-sm text-muted">Cámbiala periódicamente y no la reutilices.</p>
            </div>
            <Button variant="outline" leftIcon={KeyRound} onClick={() => notifyPending('El cambio de contraseña')}>
              Cambiar contraseña
            </Button>
          </div>
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-fg">Cerrar sesión</p>
              <p className="text-sm text-muted">Sal de PhishGuard en este dispositivo.</p>
            </div>
            <Button variant="outline" leftIcon={LogOut} onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-danger">Eliminar cuenta</p>
              <p className="text-sm text-muted">Borra tu cuenta y todos sus datos de forma permanente.</p>
            </div>
            <Button variant="danger" leftIcon={Trash2} onClick={() => notifyPending('La eliminación de cuentas')}>
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
