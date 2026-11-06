import { Component, computed, inject, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { MIN_DAYS_IN_ADVANCE } from '../../utils/booking-rules';

/**
 * First error of a field, once the visitor has touched it (or tried to move on).
 *
 * The wizard's messages are translation keys; the error's own properties (`min`, `max`,
 * `maxLength`, …) fill the placeholders. A message from the server is shown as it came.
 */
@Component({
  selector: 'app-field-errors',
  templateUrl: './field-errors.html',
})
export class FieldErrors {
  private translationService = inject(TranslationService);

  readonly field = input.required<FieldTree<unknown>>();
  readonly errorId = input.required<string>();

  protected readonly message = computed(() => {
    const state = this.field()();
    if (!state.touched() || !state.invalid()) return null;
    const error = state.errors()[0];
    const params = { days: MIN_DAYS_IN_ADVANCE, ...(error as object) };
    return this.translationService.translate(error?.message ?? 'booking.errors.invalid', params);
  });
}

/** `aria-describedby` / `aria-invalid` value for an input bound to `field`. */
export function showsError(field: FieldTree<unknown>): boolean {
  const state = field();
  return state.touched() && state.invalid();
}
