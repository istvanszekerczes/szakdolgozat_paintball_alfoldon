import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Availability, BookingDraft, shortTime } from '../data/booking.models';
import { PHONE_DISPLAY, PHONE_HREF } from '../data/booking-rules';
import { FieldErrors, showsError } from './field-errors';

@Component({
  selector: 'app-slot-step',
  imports: [FormField, FieldErrors],
  template: `
    <div class="field">
      <label for="bw-date" class="field__label">Dátum</label>
      <input
        id="bw-date"
        type="date"
        class="input slot-date"
        [formField]="form().date"
        [attr.min]="minDate()"
        [attr.max]="maxDate()"
        [attr.aria-invalid]="showsError(form().date)"
        [attr.aria-describedby]="showsError(form().date) ? 'bw-date-error' : 'bw-date-hint'"
      />
      @if (showsError(form().date)) {
        <app-field-errors [field]="form().date" errorId="bw-date-error" />
      } @else {
        <p id="bw-date-hint" class="hint">Online legalább egy héttel előre lehet foglalni.</p>
      }
    </div>

    @if (dateReady()) {
      <fieldset class="slots">
        <legend class="field__label">Kezdési időpont (2 órás játék)</legend>
        @if (loading()) {
          <p class="hint" aria-live="polite">Szabad időpontok betöltése…</p>
        } @else if (loadError()) {
          <p class="field__error" role="alert">
            Nem sikerült betölteni a szabad időpontokat.
            <button type="button" class="btn btn--ghost btn--sm" (click)="retry.emit()">Újra</button>
          </p>
        } @else if (availability(); as day) {
          @if (!day.bookable) {
            <p class="hint">Erre a napra online nem lehet foglalni. Hívj minket: <a [href]="phoneHref">{{ phone }}</a>.</p>
          } @else if (!hasFreeSlot(day)) {
            <p class="hint">Ezen a napon minden időpont foglalt. Válassz másik napot, vagy hívj minket.</p>
          } @else {
            <div class="slots__grid">
              @for (slot of day.slots; track slot.start) {
                <button
                  type="button"
                  class="slot"
                  [class.is-selected]="slot.start === form().startTime().value()"
                  [attr.aria-pressed]="slot.start === form().startTime().value()"
                  [disabled]="!slot.available"
                  (click)="pick(slot.start)"
                >
                  <span class="mono">{{ short(slot.start) }}–{{ short(slot.end) }}</span>
                  @if (!slot.available) {
                    <span class="slot__taken">foglalt</span>
                  }
                </button>
              }
            </div>
          }
        }
        <app-field-errors [field]="form().startTime" errorId="bw-time-error" />
      </fieldset>
    }

    @if (ruleError(); as message) {
      <p class="field__error" role="alert">{{ message }}</p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 1.5rem;
    }
    .slot-date {
      max-width: 260px;
      color-scheme: dark;
    }
    .hint {
      font-size: 0.875rem;
      color: var(--fg-3);
    }
    .hint a {
      color: var(--accent-2);
    }
    .slots {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .slots__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.5rem;
    }
    .slot {
      display: grid;
      gap: 0.15rem;
      justify-items: center;
      padding: 0.75rem 0.5rem;
      border: 1px solid var(--line-2);
      border-radius: var(--radius-sm);
      background: var(--bg-2);
      color: var(--fg);
      font: inherit;
      cursor: pointer;
      transition: border-color var(--dur) var(--ease);
    }
    .slot:hover:not(:disabled) {
      border-color: var(--line-3);
    }
    .slot.is-selected {
      border-color: var(--accent);
      background: var(--accent-a10);
    }
    .slot:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .slot__taken {
      font-size: 0.75rem;
      color: var(--fg-3);
    }
  `,
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

  protected hasFreeSlot(day: Availability): boolean {
    return day.slots.some((slot) => slot.available);
  }

  protected pick(start: string): void {
    const field = this.form().startTime();
    field.value.set(start);
    field.markAsTouched();
  }
}
