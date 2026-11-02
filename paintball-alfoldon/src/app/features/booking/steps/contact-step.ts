import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { BookingDraft } from '../data/booking.models';
import { FieldErrors, showsError } from './field-errors';

@Component({
  selector: 'app-contact-step',
  imports: [FormField, FieldErrors],
  template: `
    <div class="field">
      <label for="bw-name" class="field__label">Teljes név</label>
      <input
        id="bw-name"
        type="text"
        class="input"
        autocomplete="name"
        placeholder="Pl. Szabó János"
        [formField]="form().name"
        [attr.aria-invalid]="showsError(form().name)"
        [attr.aria-describedby]="showsError(form().name) ? 'bw-name-error' : null"
      />
      <app-field-errors [field]="form().name" errorId="bw-name-error" />
    </div>

    <div class="row">
      <div class="field">
        <label for="bw-email" class="field__label">E-mail cím</label>
        <input
          id="bw-email"
          type="email"
          inputmode="email"
          class="input"
          autocomplete="email"
          placeholder="Pl. janos@pelda.hu"
          [formField]="form().email"
          [attr.aria-invalid]="showsError(form().email)"
          [attr.aria-describedby]="showsError(form().email) ? 'bw-email-error' : null"
        />
        <app-field-errors [field]="form().email" errorId="bw-email-error" />
      </div>

      <div class="field">
        <label for="bw-phone" class="field__label">Telefonszám</label>
        <input
          id="bw-phone"
          type="tel"
          inputmode="tel"
          class="input"
          autocomplete="tel"
          placeholder="Pl. +36 30 123 4567"
          [formField]="form().phone"
          [attr.aria-invalid]="showsError(form().phone)"
          [attr.aria-describedby]="showsError(form().phone) ? 'bw-phone-error' : null"
        />
        <app-field-errors [field]="form().phone" errorId="bw-phone-error" />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 1.25rem;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 640px) {
      .row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ContactStep {
  readonly form = input.required<FieldTree<BookingDraft>>();
  protected readonly showsError = showsError;
}
