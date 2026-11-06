import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { BookingCreated, shortTime } from '../../models/booking';
import { formatDate } from '../../utils/booking-rules';

@Component({
  selector: 'app-booking-done',
  imports: [TranslatePipe],
  templateUrl: './booking-done.html',
  styleUrl: './booking-done.scss',
})
export class BookingDone {
  private translationService = inject(TranslationService);

  readonly booking = input.required<BookingCreated>();
  readonly again = output<void>();

  protected venueName(): string {
    const booking = this.booking();
    return this.translationService.translateOr(
      `venues.${booking.venueSlug}.venue`,
      booking.venueName,
    );
  }

  protected date(): string {
    return formatDate(this.booking().date, this.translationService.locale());
  }

  protected time(): string {
    return `${shortTime(this.booking().startTime)}–${shortTime(this.booking().endTime)}`;
  }
}
