import type { KeyboardEvent } from 'react';

/** Envía el formulario con Ctrl+Enter (o Cmd+Enter en Mac) desde cualquiera de sus campos. */
export function submitOnCtrlEnter(event: KeyboardEvent<HTMLFormElement>, busy: boolean) {
  if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return;
  const { target } = event;
  if (!(target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement)) return;
  event.preventDefault();
  if (!busy) event.currentTarget.requestSubmit();
}
