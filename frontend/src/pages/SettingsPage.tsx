import { useState, type FormEvent } from 'react';
import { AtSign, KeyRound, LogOut, Save, Trash2, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Section } from '@/components/common/Section';
import { DemoTag } from '@/components/common/DemoNotice';
import { userInitials } from '@/components/layout/AccountMenu';
import { DEMO_USER } from '@/data/demoUser';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/useToast';
import { useVisualLogout } from '@/hooks/useVisualLogout';
import { formatDate } from '@/utils/format';
import { focusFirstInvalid } from '@/utils/focus';
import { isValidEmail } from '@/utils/validation';

export function SettingsPage() {
  useDocumentTitle('Configuración');
  const { notifyPending } = useToast();
  const logout = useVisualLogout();

  const [profile, setProfile] = useState({ name: DEMO_USER.name, email: DEMO_USER.email });
  const [emailError, setEmailError] = useState<string>();
  const { preferences, updatePreferences } = usePreferences();
  const [confirming, setConfirming] = useState<'history' | 'account' | null>(null);

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(profile.email)) {
      setEmailError('Introduce un correo electrónico válido.');
      focusFirstInvalid(e.currentTarget as HTMLFormElement);
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
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-strong font-semiwide text-lg font-semibold text-accent-ink">
              {userInitials(profile.name)}
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

      <Section index={2} title="Preferencias visuales" description="Ajusta cómo se muestra la aplicación. Los cambios se aplican al momento en este dispositivo.">
        <div className="flex items-center justify-between gap-4 pb-3">
          <div>
            <p className="text-sm font-medium text-fg">Tema</p>
            <p className="mt-0.5 text-sm text-muted">PhishGuard usa un tema oscuro.</p>
          </div>
          <Badge tone="neutral">Oscuro</Badge>
        </div>
        <div className="divide-y divide-line border-t border-line">
          <Switch id="pref-motion" label="Reducir animaciones" description="Desactiva transiciones y efectos de movimiento." checked={preferences.reduceMotion} onChange={(v) => updatePreferences({ reduceMotion: v })} />
          <Switch id="pref-compact" label="Tablas compactas" description="Muestra más filas en el historial." checked={preferences.compactTables} onChange={(v) => updatePreferences({ compactTables: v })} />
          <Switch id="pref-tips" label="Consejos en el analizador" description="Muestra el panel de ayuda junto al formulario." checked={preferences.showTips} onChange={(v) => updatePreferences({ showTips: v })} />
        </div>
      </Section>

      <Section index={3} title="Privacidad" description="Decide qué se conserva de tus análisis. Se recuerda en este dispositivo y se aplicará cuando el historial se guarde en tu cuenta.">
        <div className="divide-y divide-line">
          <Switch id="priv-history" label="Guardar historial" description="Conserva la puntuación y el veredicto de cada análisis." checked={preferences.saveHistory} onChange={(v) => updatePreferences({ saveHistory: v })} />
          <Switch id="priv-content" label="Guardar el contenido analizado" description="Si está desactivado, solo se guarda el resultado, nunca el texto." checked={preferences.storeContent} onChange={(v) => updatePreferences({ storeContent: v })} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="danger" leftIcon={Trash2} onClick={() => setConfirming('history')}>
            Borrar historial
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
            <Button variant="danger" leftIcon={Trash2} onClick={() => setConfirming('account')}>
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Section>

      <ConfirmDialog
        open={confirming === 'history'}
        title="¿Borrar todo el historial?"
        description="Se eliminarán tus análisis guardados en esta cuenta. Esta acción no se puede deshacer."
        confirmLabel="Borrar historial"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          setConfirming(null);
          notifyPending('Borrar el historial');
        }}
      />
      <ConfirmDialog
        open={confirming === 'account'}
        title="¿Eliminar tu cuenta?"
        description="Se borrarán tu cuenta y todos sus datos de forma permanente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar cuenta"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          setConfirming(null);
          notifyPending('La eliminación de cuentas');
        }}
      />
    </>
  );
}
