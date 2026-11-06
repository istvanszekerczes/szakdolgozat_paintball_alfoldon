import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../bookings/services/booking-service';
import { ScheduleService } from '../../../schedule/services/schedule-service';
import { AdminBooking, BookingStatus, STATUS_LABELS } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import {
  addDays,
  fullDate,
  hm,
  hoursSince,
  longDay,
  relative,
  shortDow,
  today,
} from '../../../../shared/utils/format';
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
  private bookingService = inject(BookingService);
  private scheduleService = inject(ScheduleService);

  protected readonly today = today();
  protected readonly todayLabel = fullDate(this.today);
  protected readonly labels = STATUS_LABELS;
  protected readonly hm = hm;
  protected readonly longDay = longDay;
  protected readonly relative = relative;

  protected readonly loading = computed(
    () =>
      this.bookingService.pendingLoading() ||
      this.bookingService.bookingsLoading() ||
      this.scheduleService.alertsLoading() ||
      this.scheduleService.dayScheduleLoading(),
  );
  /** A failed decision, or else the first failed load. */
  private readonly decideError = signal<string | null>(null);
  protected readonly error = computed(
    () =>
      this.decideError() ??
      this.bookingService.pendingError() ??
      this.bookingService.bookingsError() ??
      this.scheduleService.alertsError() ??
      this.scheduleService.dayScheduleError(),
  );
  protected readonly busyId = signal<number | null>(null);

  /** All pending bookings, oldest request first. */
  private readonly pending = this.bookingService.pendingBookings;
  /** Pending and accepted bookings for today and the next 6 days. */
  private readonly week = computed(() =>
    this.bookingService.bookings().filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED'),
  );
  /** Computed by the backend (/api/admin/alerts), most severe first. */
  protected readonly alerts = this.scheduleService.alerts;
  /** Today's plan: car timeline and who works. */
  protected readonly schedule = this.scheduleService.daySchedule;

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
    const longPending = this.incoming().filter(
      (b) => hoursSince(b.createdAt) > LONG_PENDING_HOURS,
    ).length;
    const urgent = this.alerts().filter((a) => a.severity === 'DANGER').length;
    return [
      { label: 'Mai játékok', value: games.length, sub: `${sum(games)} fő`, href: '#mai-jatekok' },
      {
        label: 'Beérkező foglalás',
        value: this.incoming().length,
        sub: `${longPending} régóta függő`,
        href: '#beerkezo',
      },
      {
        label: 'Következő 7 nap',
        value: weekAccepted.length,
        sub: `elfogadott játék · ${sum(weekAccepted)} fő`,
        href: '#het',
      },
      {
        label: 'Figyelmet igényel',
        value: this.alerts().length,
        sub: `${urgent} sürgős`,
        href: '#riasztasok',
        danger: urgent > 0,
      },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  /** Loads everything the overview shows; also used by the "Újra" button. */
  protected load(): void {
    this.bookingService.loadPendingBookings();
    this.bookingService.loadBookings({ from: this.today, to: addDays(this.today, 6) });
    this.scheduleService.loadAlerts();
    this.scheduleService.loadDaySchedule(this.today);
  }

  protected decide(booking: AdminBooking, status: BookingStatus): void {
    this.busyId.set(booking.id);
    this.decideError.set(null);
    this.bookingService.changeStatus(booking.id, status).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err) => {
        this.busyId.set(null);
        this.decideError.set(errorMessage(err));
      },
    });
  }
}

function sum(list: AdminBooking[]): number {
  return list.reduce((n, b) => n + b.headcount, 0);
}
