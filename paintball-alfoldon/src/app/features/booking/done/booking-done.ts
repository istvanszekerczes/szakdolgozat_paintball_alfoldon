import { Component, input, output } from '@angular/core';
import { BookingCreated, shortTime } from '../data/booking.models';
import { formatDate } from '../data/booking-rules';

@Component({
  selector: 'app-booking-done',
  template: `
    <div class="done" role="status">
      <span class="done__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <h2 class="done__title" tabindex="-1">Foglalásodat megkaptuk</h2>
      <p>
        Foglalási szám: <strong class="mono">#{{ booking().id }}</strong><br />
        {{ booking().venueName }}, {{ date() }}, <span class="mono">{{ time() }}</span>, {{ booking().headcount }} fő
      </p>
      <p class="done__status">
        Állapot: <span class="pill">függőben</span>. Kollégánk hamarosan visszaigazolja a foglalást e-mailben vagy
        telefonon.
      </p>
      <button type="button" class="btn btn--secondary" (click)="again.emit()">Új foglalás</button>
    </div>
  `,
  styles: `
    .done {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
      padding: 1.5rem 0;
      text-align: center;
    }
    .done p {
      max-width: 46ch;
    }
    .done__title:focus {
      outline: none;
    }
    .done__status {
      color: var(--fg-2);
    }
    .done .btn {
      margin-top: 0.75rem;
    }
    .done__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin-bottom: 0.5rem;
      border-radius: 50%;
      background: var(--accent);
      color: var(--on-accent);
    }
    .done__icon svg {
      width: 26px;
      height: 26px;
    }
  `,
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
