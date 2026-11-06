import { Component, input, output } from '@angular/core';
import { BookingDraft, Venue, shortTime } from '../../models/booking';
import { formatDate } from '../../utils/booking-rules';

@Component({
  selector: 'app-summary-step',
  templateUrl: './summary-step.html',
  styleUrl: './summary-step.scss',
})
export class SummaryStep {
  readonly draft = input.required<BookingDraft>();
  readonly venue = input<Venue | undefined>();
  /** Index of the step to go back to. */
  readonly edit = output<number>();

  protected date(): string {
    return this.draft().date ? formatDate(this.draft().date) : '';
  }

  protected time(): string {
    return this.draft().startTime ? shortTime(this.draft().startTime) : '';
  }
}
