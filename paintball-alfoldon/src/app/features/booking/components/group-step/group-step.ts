import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { BookingDraft, Venue } from '../../models/booking';
import { NOTE_MAX_LENGTH } from '../../utils/booking-rules';
import { FieldErrors, showsError } from '../field-errors/field-errors';

@Component({
  selector: 'app-group-step',
  imports: [FormField, FieldErrors],
  templateUrl: './group-step.html',
  styleUrl: './group-step.scss',
})
export class GroupStep {
  readonly form = input.required<FieldTree<BookingDraft>>();
  readonly venue = input<Venue | undefined>();
  protected readonly noteMax = NOTE_MAX_LENGTH;
  protected readonly showsError = showsError;
}
