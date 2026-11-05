import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingsService } from '../../../bookings/services/booking-service';
import { ScheduleService } from '../../../schedule/services/schedule-service';
import { AdminBooking, Alert, BookingStatus, DaySchedule, STATUS_LABELS } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import { addDays, fullDate, hm, hoursSince, longDay, relative, shortDow, today } from '../../../../shared/utils/format';
import { CarTimeline } from '../../../schedule/components/car-timeline/car-timeline';
import { StaffToday } from '../../../schedule/components/staff-today/staff-today';

/** A pending booking older than this is flagged as "régóta függő". */
const LONG_PENDING_HOURS = 48;

@Component({
  selector: 'app-overview',
  imports: [RouterLink, CarTimeline, StaffToday],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit {
  private readonly bookings = inject(BookingsService);
  private readonly scheduleApi = inject(ScheduleService);

  protected readonly today = today();
  protected readonly todayLabel = fullDate(this.today);
  protected readonly labels = STATUS_LABELS;
  protected readonly hm = hm;
  protected readonly longDay = longDay;
  protected readonly relative = relative;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);

  /** All pending bookings, oldest request first. */
  private readonly pending = signal<AdminBooking[]>([]);
  /** Pending and accepted bookings for today and the next 6 days. */
  private readonly week = signal<AdminBooking[]>([]);
  /** Computed by the backend (/api/admin/alerts), most severe first. */
  protected readonly alerts = signal<Alert[]>([]);
  /** Today's plan: car timeline and who works. */
  protected readonly schedule = signal<DaySchedule | null>(null);

  protected readonly incoming = computed(() =>
    [...this.pending()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );

  protected readonly todaysGames = computed(() =>
    this.week()
      .filter((b) => b.date === this.today && b.status === 'ACCEPTED')
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  protected readonly days = computed(() => {
    const list = this.week();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(this.today, i);
      return {
        date,
        dow: shortDow(date),
        day: Number(date.slice(8)),
        events: list
          .filter((b) => b.date === date)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
    });
  });

  protected readonly kpis = computed(() => {
    const games = this.todaysGames();
    const weekAccepted = this.week().filter((b) => b.status === 'ACCEPTED');
    const longPending = this.incoming().filter((b) => hoursSince(b.createdAt) > LONG_PENDING_HOURS).length;
    const urgent = this.alerts().filter((a) => a.severity === 'DANGER').length;
    return [
      { label: 'Mai játékok', value: games.length, sub: `${sum(games)} fő`, href: '#mai-jatekok' },
      { label: 'Beérkező foglalás', value: this.incoming().length, sub: `${longPending} régóta függő`, href: '#beerkezo' },
      { label: 'Következő 7 nap', value: weekAccepted.length, sub: `elfogadott játék · ${sum(weekAccepted)} fő`, href: '#het' },
      { label: 'Figyelmet igényel', value: this.alerts().length, sub: `${urgent} sürgős`, href: '#riasztasok', danger: urgent > 0 },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      pending: this.bookings.list({ status: 'PENDING' }),
      week: this.bookings.list({ from: this.today, to: addDays(this.today, 6) }),
      alerts: this.scheduleApi.alerts(),
      schedule: this.scheduleApi.day(this.today),
    }).subscribe({
      next: ({ pending, week, alerts, schedule }) => {
        this.pending.set(pending);
        this.alerts.set(alerts);
        this.schedule.set(schedule);
        this.week.set(week.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED'));
        this.bookings.pendingCount.set(pending.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected decide(booking: AdminBooking, status: BookingStatus): void {
    this.busyId.set(booking.id);
    this.bookings.changeStatus(booking.id, status).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(errorMessage(err));
      },
    });
  }
}

function sum(list: AdminBooking[]): number {
  return list.reduce((n, b) => n + b.headcount, 0);
}
