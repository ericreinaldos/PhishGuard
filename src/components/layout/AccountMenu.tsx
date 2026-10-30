import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Settings } from 'lucide-react';
import { DEMO_USER } from '@/data/demoUser';
import { useToast } from '@/hooks/useToast';
import { useVisualLogout } from '@/hooks/useVisualLogout';
import { cn } from '@/utils/cn';

export const userInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

/** Menú de cuenta de la cabecera: perfil, notificaciones (pendiente) y cierre de sesión visual. */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { notifyPending } = useToast();
  const logout = useVisualLogout();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label="Mi cuenta"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm text-muted transition-colors hover:text-fg"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-strong font-mono text-[11px] font-medium text-white">
          {userInitials(DEMO_USER.name)}
        </span>
        Mi cuenta
      </button>

      <div
        id={id}
        className={cn(
          'absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-pop transition-[opacity,transform] duration-200',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="border-b border-line px-4 py-3">
          <p className="truncate text-sm font-medium text-fg">{DEMO_USER.name}</p>
          <p className="truncate font-mono text-[11px] text-subtle">{DEMO_USER.email}</p>
        </div>
        <div className="py-1">
          <Link to="/settings" className={item} onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4" aria-hidden />
            Perfil y configuración
          </Link>
          <button
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              notifyPending('El centro de notificaciones');
            }}
          >
            <Bell className="h-4 w-4" aria-hidden />
            Notificaciones
          </button>
        </div>
        <div className="border-t border-line py-1">
          <button type="button" className={cn(item, 'hover:bg-danger/10 hover:text-danger')} onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
