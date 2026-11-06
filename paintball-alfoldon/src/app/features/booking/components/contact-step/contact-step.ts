import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { BookingDraft } from '../../models/booking';
import { FieldErrors, showsError } from '../field-errors/field-errors';

@Component({
  selector: 'app-contact-step',
  imports: [FormField, FieldErrors],
  templateUrl: './contact-step.html',
  styleUrl: './contact-step.scss',
})
export class ContactStep {
  readonly form = input.required<FieldTree<BookingDraft>>();
  protected readonly showsError = showsError;
}
