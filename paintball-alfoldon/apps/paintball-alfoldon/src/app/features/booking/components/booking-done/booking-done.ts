import { Component, input, output } from '@angular/core';
import { BookingCreated, shortTime } from '../../models/booking';
import { formatDate } from '../../utils/booking-rules';

@Component({
  selector: 'app-booking-done',
  templateUrl: './booking-done.html',
  styleUrl: './booking-done.scss',
})
export class BookingDone {
  readonly booking = input.required<BookingCreated>();
  readonly again = output<void>();

  protected date(): string {
    return formatDate(this.booking().date);
  }

  protected time(): string {
    return `${shortTime(this.booking().startTime)}–${shortTime(this.booking().endTime)}`;
  }
}
