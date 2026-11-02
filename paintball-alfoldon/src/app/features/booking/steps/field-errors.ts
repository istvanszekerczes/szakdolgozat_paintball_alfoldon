import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/** First error of a field, once the visitor has touched it (or tried to move on). */
@Component({
  selector: 'app-field-errors',
  template: `
    @if (message(); as text) {
      <p class="field__error" [id]="errorId()">{{ text }}</p>
    }
  `,
})
export class FieldErrors {
  readonly field = input.required<FieldTree<unknown>>();
  readonly errorId = input.required<string>();

  protected readonly message = computed(() => {
    const state = this.field()();
    return state.touched() && state.invalid() ? (state.errors()[0]?.message ?? 'Hibás érték.') : null;
  });
}

/** `aria-describedby` / `aria-invalid` value for an input bound to `field`. */
export function showsError(field: FieldTree<unknown>): boolean {
  const state = field();
  return state.touched() && state.invalid();
}
