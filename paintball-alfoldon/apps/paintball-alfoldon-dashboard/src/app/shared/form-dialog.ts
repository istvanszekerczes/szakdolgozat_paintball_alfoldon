import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Modal form on top of the native <dialog> (focus trap and Esc for free). The fields are projected;
 * the page decides what "save" does and passes back busy / error.
 */
@Component({
  selector: 'app-form-dialog',
  template: `
    <dialog #dialog class="dialog" [attr.aria-labelledby]="titleId" (close)="closed.emit()">
      <form class="dialog-form" (submit)="submit($event)">
        <h2 [id]="titleId">{{ title() }}</h2>
        <ng-content />
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <div class="dialog-actions">
          <button class="btn btn-ghost" type="button" (click)="dialog.close()">{{ saveLabel() ? cancelLabel() : 'Bezárás' }}</button>
          @if (saveLabel()) {
            <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'Mentés…' : saveLabel() }}</button>
          }
        </div>
      </form>
    </dialog>
  `,
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
