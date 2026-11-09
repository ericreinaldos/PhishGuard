import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación de acciones destructivas sobre <dialog> nativo: el navegador aporta la capa
 * superior, el foco atrapado, Escape y la vuelta del foco al botón que lo abrió.
 * «Cancelar» va primero en el DOM para recibir el foco inicial y ser la opción segura.
 */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = 'Cancelar', onConfirm, onCancel }: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      // Un clic fuera del contenido llega al propio <dialog>
      onClick={(e) => e.target === dialog.current && onCancel()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-fg shadow-pop backdrop:bg-black/70"
    >
      <div className="p-6">
        <h2 id={titleId} className="font-semiwide text-xl font-semibold leading-tight text-fg">
          {title}
        </h2>
        <p id={descriptionId} className="mt-3 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
