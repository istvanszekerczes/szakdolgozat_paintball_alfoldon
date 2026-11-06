import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Availability, BookingDraft, shortTime } from '../../models/booking';
import { PHONE_DISPLAY, PHONE_HREF } from '../../utils/booking-rules';
import { FieldErrors, showsError } from '../field-errors/field-errors';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';

@Component({
  selector: 'app-slot-step',
  imports: [FormField, FieldErrors, TranslatePipe],
  templateUrl: './slot-step.html',
  styleUrl: './slot-step.scss',
})
export class SlotStep {
  readonly form = input.required<FieldTree<BookingDraft>>();
  readonly minDate = input.required<string>();
  readonly maxDate = input.required<string>();
  /** True once the picked date is inside the bookable range, so asking for slots makes sense. */
  readonly dateReady = input.required<boolean>();
  readonly availability = input<Availability | undefined>();
  readonly loading = input(false);
  readonly loadError = input(false);
  /** A refusal from the server (422) or a slot taken in the meantime (409). */
  readonly ruleError = input<string | null>(null);
  readonly retry = output<void>();

  protected readonly phone = PHONE_DISPLAY;
  protected readonly phoneHref = PHONE_HREF;
  protected readonly showsError = showsError;
  protected readonly short = shortTime;

  protected hasRecommended(day: Availability): boolean {
    return day.slots.some((slot) => slot.recommended);
  }

  protected hasFreeSlot(day: Availability): boolean {
    return day.slots.some((slot) => slot.available);
  }

  protected pick(start: string): void {
    const field = this.form().startTime();
    field.value.set(start);
    field.markAsTouched();
  }
}
