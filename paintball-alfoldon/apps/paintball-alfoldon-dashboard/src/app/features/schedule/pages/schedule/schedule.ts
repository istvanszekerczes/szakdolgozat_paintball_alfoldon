import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingsService } from '../../../bookings/services/booking-service';
import { ScheduleService } from '../../services/schedule-service';
import { AdminBooking, DaySchedule } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import { addDays, fullDate, hm, today } from '../../../../shared/utils/format';
import { AssignmentPanel } from '../../components/assignment-panel/assignment-panel';
import { CarTimeline } from '../../components/car-timeline/car-timeline';
import { StaffToday } from '../../components/staff-today/staff-today';

/** Beosztás: pick a day, assign a car and staff to each accepted game, see the result on the timeline. */
@Component({
  selector: 'app-schedule',
  imports: [RouterLink, AssignmentPanel, CarTimeline, StaffToday],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
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
    const input = event.target as HTMLInputElement;
    if (input.value) this.setDate(input.value);
    // Clearing the field picks no day, so it goes back to showing the current one.
    else input.value = this.date();
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
