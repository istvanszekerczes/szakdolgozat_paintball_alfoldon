import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Modal form on top of the native <dialog> (focus trap and Esc for free). The fields are projected;
 * the page decides what "save" does and passes back busy / error.
 */
@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.html',
})
export class FormDialog {
  private static nextId = 0;

  readonly open = input(false);
  readonly title = input.required<string>();
  readonly busy = input(false);
  readonly error = input<string | null>(null);
  /** Empty: the dialog only shows information and has a single "Bezárás" button. */
  readonly saveLabel = input('Mentés');
  readonly cancelLabel = input('Mégse');

  readonly save = output<void>();
  readonly closed = output<void>();

  protected readonly titleId = `form-dialog-${FormDialog.nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) el.showModal();
      if (!this.open() && el.open) el.close();
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.busy()) this.save.emit();
  }
}
