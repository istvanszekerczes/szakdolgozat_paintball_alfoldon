import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../bookings/services/booking-service';
import { ScheduleService } from '../../services/schedule-service';
import { addDays, fullDate, hm, today } from '../../../../shared/utils/format';
import { AssignmentPanel } from '../../components/assignment-panel/assignment-panel';
import { CarTimeline } from '../../components/car-timeline/car-timeline';
import { StaffToday } from '../../components/staff-today/staff-today';
import { ProposalPanel } from '../../components/proposal-panel/proposal-panel';

/** Beosztás: pick a day, assign a car and staff to each accepted game, see the result on the timeline. */
@Component({
  selector: 'app-schedule',
  imports: [RouterLink, AssignmentPanel, CarTimeline, StaffToday, ProposalPanel],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
  private bookingService = inject(BookingService);
  private scheduleService = inject(ScheduleService);
  private router = inject(Router);

  readonly datum = input<string>();

  protected readonly hm = hm;
  protected readonly todayIso = today();
  protected readonly date = computed(() =>
    /^\d{4}-\d{2}-\d{2}$/.test(this.datum() ?? '') ? this.datum()! : today(),
  );
  protected readonly title = computed(() => fullDate(this.date()));

  /** Accepted games of the day (the list is loaded with status=ACCEPTED). */
  protected readonly games = this.bookingService.bookings;
  protected readonly schedule = this.scheduleService.daySchedule;
  protected readonly loading = computed(
    () => this.bookingService.bookingsLoading() || this.scheduleService.dayScheduleLoading(),
  );
  protected readonly error = computed(
    () => this.bookingService.bookingsError() ?? this.scheduleService.dayScheduleError(),
  );

  constructor() {
    effect(() => {
      const date = this.date();
      untracked(() => {
        this.bookingService.loadBookings({ from: date, to: date, status: 'ACCEPTED' });
        this.scheduleService.loadDaySchedule(date);
      });
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
}
