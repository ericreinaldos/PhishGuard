import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastTone = 'info' | 'success' | 'warning';

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface ToastContextValue {
  notify: (toast: Omit<Toast, 'id'>) => void;
  /** Atajo para acciones visibles que aún no tienen implementación. */
  notifyPending: (feature: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-info' },
  success: { icon: CheckCircle2, className: 'text-safe' },
  warning: { icon: TriangleAlert, className: 'text-warning' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<ToastContextValue['notify']>(
    (toast) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const notifyPending = useCallback(
    (feature: string) =>
      notify({
        tone: 'info',
        title: 'Funcionalidad pendiente',
        description: `${feature} se implementará en una próxima fase.`,
      }),
    [notify],
  );

  const value = useMemo(() => ({ notify, notifyPending }), [notify, notifyPending]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96"
      >
        {toasts.map((toast) => {
          const { icon: Icon, className } = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full animate-fade-up items-start gap-3 rounded-xl border border-line bg-surface-2/95 p-4 shadow-card backdrop-blur"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-sm text-muted">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-subtle transition hover:bg-surface-3 hover:text-fg"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
