/** Tras un envío fallido, lleva el foco al primer campo inválido cuando React ya ha pintado los errores. */
export function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
