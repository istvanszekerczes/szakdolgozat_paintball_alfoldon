import { Component, DestroyRef, PLATFORM_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { AdminBooking } from '../../models/booking';
import { addDays, fullDate, hm, parseDate, shortDow, today } from '../../../../shared/utils/format';
import { BookingDetail } from '../../components/booking-detail/booking-detail';

/** Visible hours of the grid; the fixed slots run 8:00–20:00. */
const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const HOUR_PX = 52;

interface Placed {
  booking: AdminBooking;
  top: number;
  height: number;
  /** Left edge and width in % of the day column, so parallel games sit side by side. */
  left: number;
  width: number;
}

interface DayColumn {
  date: string;
  dow: string;
  day: number;
  isToday: boolean;
  events: Placed[];
}

/**
 * Naptár: week (Monday–Sunday) or day view of pending and accepted games. Accepted games are filled,
 * pending ones have a dashed outline. View and date live in the URL (?nezet=nap&datum=2026-11-07).
 */
@Component({
  selector: 'app-calendar',
  imports: [BookingDetail],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  readonly nezet = input<string>();
  readonly datum = input<string>();

  protected readonly hm = hm;
  protected readonly hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
  protected readonly gridHeight = (LAST_HOUR - FIRST_HOUR) * HOUR_PX;
  protected readonly hourPx = HOUR_PX;

  /** Pending and accepted games; rejected and cancelled ones are not shown. */
  protected readonly list = computed(() =>
    this.bookingService
      .bookings()
      .filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED'),
  );
  protected readonly loading = this.bookingService.bookingsLoading;
  protected readonly error = this.bookingService.bookingsError;
  protected readonly selectedId = signal<number | null>(null);
  protected readonly selected = computed(() => this.list().find((b) => b.id === this.selectedId()) ?? null);
  private readonly now = signal(new Date());

  /** Phones: seven day columns don't fit, so the calendar opens on the day view there. */
  private readonly narrow = signal(false);
  private readonly defaultView = computed<'het' | 'nap'>(() => (this.narrow() ? 'nap' : 'het'));

  protected readonly view = computed<'het' | 'nap'>(() => {
    const nezet = this.nezet();
    return nezet === 'nap' || nezet === 'het' ? nezet : this.defaultView();
  });
  protected readonly date = computed(() => (/^\d{4}-\d{2}-\d{2}$/.test(this.datum() ?? '') ? this.datum()! : today()));

  /** First and last day shown. */
  protected readonly range = computed(() => {
    if (this.view() === 'nap') return { from: this.date(), to: this.date() };
    const monday = addDays(this.date(), -((parseDate(this.date()).getDay() + 6) % 7));
    return { from: monday, to: addDays(monday, 6) };
  });

  protected readonly title = computed(() => {
    const { from, to } = this.range();
    if (from === to) return fullDate(from);
    const fmt = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' });
    return `${parseDate(from).getFullYear()}. ${fmt.format(parseDate(from))} – ${fmt.format(parseDate(to))}`;
  });

  protected readonly columns = computed<DayColumn[]>(() => {
    const { from, to } = this.range();
    const days: DayColumn[] = [];
    for (let date = from; date <= to; date = addDays(date, 1)) {
      days.push({
        date,
        dow: shortDow(date),
        day: Number(date.slice(8)),
        isToday: date === today(),
        events: place(this.list().filter((b) => b.date === date)),
      });
    }
    return days;
  });

  /** Position of the "most" line, or null when it is outside the grid. */
  protected readonly nowTop = computed(() => {
    const d = this.now();
    const minutes = (d.getHours() - FIRST_HOUR) * 60 + d.getMinutes();
    return minutes < 0 || minutes > (LAST_HOUR - FIRST_HOUR) * 60 ? null : (minutes / 60) * HOUR_PX;
  });

  protected readonly counts = computed(() => ({
    accepted: this.list().filter((b) => b.status === 'ACCEPTED').length,
    pending: this.list().filter((b) => b.status === 'PENDING').length,
  }));

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const query = window.matchMedia('(max-width: 640px)');
      this.narrow.set(query.matches);
      const onChange = (e: MediaQueryListEvent) => this.narrow.set(e.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }
    effect(() => {
      const range = this.range();
      untracked(() => this.bookingService.loadBookings({ from: range.from, to: range.to }));
    });
    effect((onCleanup) => {
      const timer = setInterval(() => this.now.set(new Date()), 60_000);
      onCleanup(() => clearInterval(timer));
    });
  }

  protected go(step: number): void {
    const days = this.view() === 'nap' ? step : step * 7;
    this.navigate(this.view(), addDays(this.date(), days));
  }

  protected goToday(): void {
    this.navigate(this.view(), today());
  }

  protected navigate(view: 'het' | 'nap', date: string): void {
    this.router.navigate(['/naptar'], {
      queryParams: { nezet: view === this.defaultView() ? null : view, datum: date === today() ? null : date },
    });
  }

}

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Puts the games of one day into lanes: overlapping games get separate lanes of equal width. */
function place(bookings: AdminBooking[]): Placed[] {
  const sorted = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime) || a.venueName.localeCompare(b.venueName, 'hu'));
  const laneEnds: number[] = [];
  const lanes = sorted.map((b) => {
    let lane = laneEnds.findIndex((end) => end <= minutes(b.startTime));
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = minutes(b.endTime);
    return lane;
  });
  const count = Math.max(1, laneEnds.length);
  return sorted.map((b, i) => {
    const start = Math.max(minutes(b.startTime), FIRST_HOUR * 60);
    const end = Math.min(minutes(b.endTime), LAST_HOUR * 60);
    return {
      booking: b,
      top: ((start - FIRST_HOUR * 60) / 60) * HOUR_PX,
      height: Math.max(((end - start) / 60) * HOUR_PX - 2, 18),
      left: (lanes[i] / count) * 100,
      width: 100 / count,
    };
  });
}

