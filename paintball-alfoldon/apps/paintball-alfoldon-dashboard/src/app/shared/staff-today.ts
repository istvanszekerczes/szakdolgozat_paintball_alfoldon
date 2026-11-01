import { Component, input } from '@angular/core';
import { DaySchedule, EMPLOYMENT_LABELS } from '../core/models';
import { hm } from '../core/format';
import { StatusBadge } from './status-badge';

/** Who works on the day, from leaving the base until getting back, and with which car. */
@Component({
  selector: 'app-staff-today',
  imports: [StatusBadge],
  template: `
    @for (s of schedule().staff; track s.employeeId) {
      <article class="row">
        <span class="avatar" aria-hidden="true">{{ s.name.slice(0, 1) }}</span>
        <div class="grow">
          <strong>{{ s.name }}</strong>
          <span class="muted small">{{ s.venues.join(', ') }}{{ s.cars.length ? ' · ' + s.cars.join(', ') : ' · nincs autó' }}</span>
        </div>
        @if (s.excluded) {
          <app-status-badge label="Távol van!" tone="danger" />
        } @else {
          <app-status-badge [label]="labels[s.employmentType]" [tone]="s.employmentType === 'FULL_TIME' ? 'info' : 'muted'" />
        }
        <span class="mono hours">{{ hm(s.from) }}–{{ hm(s.to) }}</span>
      </article>
    } @empty {
      <p class="empty">{{ emptyText() }}</p>
    }
  `,
  styles: `
    .row { gap: 10px 12px; padding: 10px 0; flex-wrap: nowrap; }
    .grow { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .grow span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .avatar { flex: 0 0 32px; height: 32px; border-radius: 999px; background: var(--bg-3); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
    .small { font-size: 12px; }
    .hours { font-size: 13px; white-space: nowrap; }
  `,
})
export class StaffToday {
  readonly schedule = input.required<DaySchedule>();
  readonly emptyText = input('Ezen a napon még senki nincs beosztva.');

  protected readonly labels = EMPLOYMENT_LABELS;
  protected readonly hm = hm;
}
