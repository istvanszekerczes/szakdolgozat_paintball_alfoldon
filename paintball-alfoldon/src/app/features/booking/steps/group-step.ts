import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { BookingDraft, Venue } from '../data/booking.models';
import { NOTE_MAX_LENGTH } from '../data/booking-rules';
import { FieldErrors, showsError } from './field-errors';

@Component({
  selector: 'app-group-step',
  imports: [FormField, FieldErrors],
  template: `
    <div class="field">
      <label for="bw-headcount" class="field__label">Létszám (fő)</label>
      <input
        id="bw-headcount"
        type="number"
        inputmode="numeric"
        class="input count"
        [formField]="form().headcount"
        [attr.aria-invalid]="showsError(form().headcount)"
        [attr.aria-describedby]="showsError(form().headcount) ? 'bw-headcount-error' : 'bw-headcount-hint'"
      />
      @if (showsError(form().headcount)) {
        <app-field-errors [field]="form().headcount" errorId="bw-headcount-error" />
      } @else if (venue(); as v) {
        <p id="bw-headcount-hint" class="hint">Ezen a pályán {{ v.minHeadcount }}–{{ v.maxHeadcount }} fő játszhat egyszerre.</p>
      }
    </div>

    <div class="field">
      <label for="bw-note" class="field__label">Megjegyzés (nem kötelező)</label>
      <textarea
        id="bw-note"
        class="input"
        rows="4"
        [formField]="form().note"
        placeholder="Pl. születésnap, céges csapatépítő, kért kiegészítő program…"
        [attr.aria-invalid]="showsError(form().note)"
        [attr.aria-describedby]="showsError(form().note) ? 'bw-note-error' : 'bw-note-hint'"
      ></textarea>
      @if (showsError(form().note)) {
        <app-field-errors [field]="form().note" errorId="bw-note-error" />
      } @else {
        <p id="bw-note-hint" class="hint">{{ form().note().value().length }} / {{ noteMax }} karakter</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 1.25rem;
    }
    .count {
      max-width: 160px;
    }
    .hint {
      font-size: 0.875rem;
      color: var(--fg-3);
    }
  `,
})
export class GroupStep {
  readonly form = input.required<FieldTree<BookingDraft>>();
  readonly venue = input<Venue | undefined>();
  protected readonly noteMax = NOTE_MAX_LENGTH;
  protected readonly showsError = showsError;
}
