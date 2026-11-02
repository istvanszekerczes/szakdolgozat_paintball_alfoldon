import { Component, input, output } from '@angular/core';
import { Venue } from '../data/booking.models';

@Component({
  selector: 'app-venue-step',
  template: `
    <ul class="venues" role="list">
      @for (venue of venues(); track venue.slug) {
        <li>
          <button
            type="button"
            class="venue card card--interactive"
            [class.is-selected]="venue.slug === selected()"
            [attr.aria-pressed]="venue.slug === selected()"
            (click)="picked.emit(venue.slug)"
          >
            <span class="venue__head">
              <span class="venue__city">{{ venue.city }}</span>
              <span class="pill" [class.pill--accent]="venue.indoor">{{ venue.indoor ? 'Fedett' : 'Szabadtéri' }}</span>
            </span>
            <span class="venue__name">{{ venue.name }}</span>
            <span class="venue__meta mono">{{ venue.minHeadcount }}–{{ venue.maxHeadcount }} fő</span>
          </button>
        </li>
      }
    </ul>
  `,
  styles: `
    .venues {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .venue {
      display: grid;
      gap: 0.35rem;
      width: 100%;
      height: 100%;
      text-align: left;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .venue.is-selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .venue__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .venue__city {
      font-weight: 600;
      font-size: 1.0625rem;
    }
    .venue__name {
      color: var(--fg-2);
    }
    .venue__meta {
      font-size: 0.8125rem;
      color: var(--fg-3);
    }
  `,
})
export class VenueStep {
  readonly venues = input.required<Venue[]>();
  readonly selected = input<string>('');
  readonly picked = output<string>();
}
