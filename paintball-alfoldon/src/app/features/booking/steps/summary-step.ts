import { Component, input, output } from '@angular/core';
import { BookingDraft, Venue, shortTime } from '../data/booking.models';
import { formatDate } from '../data/booking-rules';

@Component({
  selector: 'app-summary-step',
  template: `
    <dl class="summary">
      <div class="summary__row">
        <dt>Pálya</dt>
        <dd>{{ venue()?.city }} – {{ venue()?.name }}</dd>
        <button type="button" class="btn btn--ghost btn--sm" (click)="edit.emit(0)">Módosítás</button>
      </div>
      <div class="summary__row">
        <dt>Időpont</dt>
        <dd>{{ date() }}, <span class="mono">{{ time() }}</span></dd>
        <button type="button" class="btn btn--ghost btn--sm" (click)="edit.emit(1)">Módosítás</button>
      </div>
      <div class="summary__row">
        <dt>Létszám</dt>
        <dd>{{ draft().headcount }} fő</dd>
        <button type="button" class="btn btn--ghost btn--sm" (click)="edit.emit(2)">Módosítás</button>
      </div>
      @if (draft().note.trim()) {
        <div class="summary__row">
          <dt>Megjegyzés</dt>
          <dd class="summary__note">{{ draft().note }}</dd>
          <button type="button" class="btn btn--ghost btn--sm" (click)="edit.emit(2)">Módosítás</button>
        </div>
      }
      <div class="summary__row">
        <dt>Kapcsolattartó</dt>
        <dd>
          {{ draft().name }}<br />
          <span class="muted">{{ draft().email }} · {{ draft().phone }}</span>
        </dd>
        <button type="button" class="btn btn--ghost btn--sm" (click)="edit.emit(3)">Módosítás</button>
      </div>
      <div class="summary__row">
        <dt>Fizetés</dt>
        <dd>Helyszínen fizetendő. Az árat a foglalás visszaigazolásakor pontosítjuk.</dd>
      </div>
    </dl>
  `,
  styles: `
    .summary {
      display: grid;
      margin: 0;
    }
    .summary__row {
      display: grid;
      grid-template-columns: 9rem 1fr auto;
      gap: 0.75rem;
      align-items: baseline;
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--line);
    }
    .summary__row:last-child {
      border-bottom: 0;
    }
    dt {
      color: var(--fg-3);
      font-size: 0.875rem;
    }
    dd {
      margin: 0;
    }
    .summary__note {
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    .muted {
      color: var(--fg-2);
      font-size: 0.9375rem;
      overflow-wrap: anywhere;
    }
    @media (max-width: 560px) {
      .summary__row {
        grid-template-columns: 1fr auto;
      }
      dt {
        grid-column: 1 / -1;
      }
    }
  `,
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
