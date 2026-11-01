import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingsService } from '../../core/bookings.service';
import { ScheduleService } from '../../core/schedule.service';
import { AdminBooking, DaySchedule } from '../../core/models';
import { errorMessage } from '../../core/api';
import { addDays, fullDate, hm, today } from '../../core/format';
import { AssignmentPanel } from '../../shared/assignment-panel';
import { CarTimeline } from '../../shared/car-timeline';
import { StaffToday } from '../../shared/staff-today';

/** Beosztás: pick a day, assign a car and staff to each accepted game, see the result on the timeline. */
@Component({
  selector: 'app-schedule',
  imports: [RouterLink, AssignmentPanel, CarTimeline, StaffToday],
  template: `
    <header class="page-head">
      <div>
        <h1>Beosztás</h1>
        <p class="muted">{{ title() }}</p>
      </div>
    </header>

    <div class="card toolbar">
      <button class="btn btn-ghost" type="button" aria-label="Előző nap" (click)="go(-1)">‹</button>
      <label class="field">
        <span class="sr-only">Nap</span>
        <input class="input" type="date" [value]="date()" (change)="pick($event)" />
      </label>
      <button class="btn btn-ghost" type="button" aria-label="Következő nap" (click)="go(1)">›</button>
      <button class="btn btn-ghost" type="button" (click)="setDate(todayIso)">Ma</button>
      <span class="muted note">Kiírások (műszakvállalás): hamarosan</span>
    </div>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    <section class="card" aria-labelledby="idovonal-cim">
      <div class="card-head"><h2 id="idovonal-cim">Autók</h2></div>
      @if (schedule(); as s) {
        <app-car-timeline [schedule]="s" />
      } @else {
        <p class="muted">Betöltés…</p>
      }
    </section>

    <div class="cols">
      <section class="card games" aria-labelledby="jatekok-cim">
        <div class="card-head">
          <h2 id="jatekok-cim">Elfogadott játékok</h2>
          <span class="muted small">{{ games().length }} játék</span>
        </div>
        @for (g of games(); track g.id) {
          <article class="game">
            <div class="game-head">
              <span class="mono time">{{ hm(g.startTime) }}–{{ hm(g.endTime) }}</span>
              <div class="grow">
                <strong>{{ g.venueName }}</strong>
                <span class="muted small">{{ g.customer.name }} · {{ g.headcount }} fő</span>
              </div>
              <a class="link" [routerLink]="['/foglalasok', g.id]">Részletek →</a>
            </div>
            <app-assignment-panel [booking]="g" (updated)="onAssigned($event)" />
          </article>
        } @empty {
          <p class="empty">{{ loading() ? 'Betöltés…' : 'Ezen a napon nincs elfogadott játék.' }}</p>
        }
      </section>

      <section class="card" aria-labelledby="dolgozok-cim">
        <div class="card-head"><h2 id="dolgozok-cim">Ki dolgozik</h2></div>
        @if (schedule(); as s) {
          <app-staff-today [schedule]="s" />
        }
      </section>
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 20px; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px; }
    .note { margin-left: auto; font-size: 12px; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .cols { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
    .game { border-top: 1px solid var(--line); padding: 14px 0; display: flex; flex-direction: column; gap: 12px; }
    .game-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .time { font-size: 14px; }
    .grow { flex: 1 1 180px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .small { font-size: 12px; }
    @media (max-width: 1100px) { .cols { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class SchedulePage {
  private readonly bookings = inject(BookingsService);
  private readonly scheduleApi = inject(ScheduleService);
  private readonly router = inject(Router);

  readonly datum = input<string>();

  protected readonly hm = hm;
  protected readonly todayIso = today();
  protected readonly date = computed(() => (/^\d{4}-\d{2}-\d{2}$/.test(this.datum() ?? '') ? this.datum()! : today()));
  protected readonly title = computed(() => fullDate(this.date()));

  protected readonly games = signal<AdminBooking[]>([]);
  protected readonly schedule = signal<DaySchedule | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const date = this.date();
      untracked(() => this.load(date));
    });
  }

  protected go(days: number): void {
    this.setDate(addDays(this.date(), days));
  }

  protected pick(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.setDate(value);
  }

  protected setDate(date: string): void {
    this.router.navigate(['/beosztas'], { queryParams: { datum: date === today() ? null : date } });
  }

  protected onAssigned(updated: AdminBooking): void {
    this.games.update((list) => list.map((g) => (g.id === updated.id ? updated : g)));
    this.scheduleApi.day(this.date()).subscribe({ next: (s) => this.schedule.set(s) });
  }

  private load(date: string): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      games: this.bookings.list({ from: date, to: date, status: 'ACCEPTED' }),
      schedule: this.scheduleApi.day(date),
    }).subscribe({
      next: ({ games, schedule }) => {
        this.games.set(games);
        this.schedule.set(schedule);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
