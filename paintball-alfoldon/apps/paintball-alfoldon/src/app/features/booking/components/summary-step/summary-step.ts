import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { BookingDraft, Venue, shortTime } from '../../models/booking';
import { formatDate } from '../../utils/booking-rules';

@Component({
  selector: 'app-summary-step',
  imports: [TranslatePipe],
  templateUrl: './summary-step.html',
  styleUrl: './summary-step.scss',
})
export class SummaryStep {
  private translationService = inject(TranslationService);

  readonly draft = input.required<BookingDraft>();
  readonly venue = input<Venue | undefined>();
  /** Index of the step to go back to. */
  readonly edit = output<number>();

  protected venueName(): string {
    const venue = this.venue();
    return venue
      ? this.translationService.translateOr(`venues.${venue.slug}.venue`, venue.name)
      : '';
  }

  protected date(): string {
    return this.draft().date ? formatDate(this.draft().date, this.translationService.locale()) : '';
  }

  protected time(): string {
    return this.draft().startTime ? shortTime(this.draft().startTime) : '';
  }
}
