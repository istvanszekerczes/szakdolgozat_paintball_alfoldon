import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { AdminBooking, BookingFilter, BookingStatus, STATUS_LABELS } from '../../models/booking';
import { hm, longDay, relative } from '../../../../shared/utils/format';
import { BookingDetail } from '../../components/booking-detail/booking-detail';

const STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

/** Filterable booking list; /foglalasok/:id opens one booking in the side panel. Filters live in the URL. */
@Component({
  selector: 'app-bookings',
  imports: [RouterLink, BookingDetail],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Route params and query params, bound by withComponentInputBinding().
  readonly id = input<string>();
  readonly status = input<string>();
  readonly from = input<string>();
  readonly to = input<string>();
  readonly venue = input<string>();

  protected readonly statuses = STATUSES;
  protected readonly labels = STATUS_LABELS;
  protected readonly hm = hm;
  protected readonly longDay = longDay;
  protected readonly relative = relative;

  protected readonly list = computed(() =>
    [...this.bookingService.bookings()].sort((a, b) =>
      (a.date + a.startTime).localeCompare(b.date + b.startTime),
    ),
  );
  protected readonly loading = this.bookingService.bookingsLoading;
  protected readonly error = this.bookingService.bookingsError;

  /** Venues seen so far, for the venue filter (the venue list endpoint is public-site only). */
  private readonly seenVenues = signal(new Map<string, string>());
  protected readonly venues = computed(() =>
    [...this.seenVenues()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, 'hu')),
  );

  protected readonly filter = computed<BookingFilter>(() => ({
    status: STATUSES.includes(this.status() as BookingStatus) ? (this.status() as BookingStatus) : undefined,
    from: this.from() || undefined,
    to: this.to() || undefined,
    venue: this.venue() || undefined,
  }));

  protected readonly hasFilter = computed(() => Object.values(this.filter()).some(Boolean));

  protected readonly selectedId = computed(() => Number(this.id()) || null);
  protected readonly selected = computed(() => this.list().find((b) => b.id === this.selectedId()) ?? null);

  constructor() {
    effect(() => {
      const filter = this.filter();
      untracked(() => this.bookingService.loadBookings(filter));
    });
    effect(() => {
      const list = this.bookingService.bookings();
      untracked(() => this.rememberVenues(list));
    });
  }

  protected setFilter(key: keyof BookingFilter, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value || null;
    this.router.navigate(['/foglalasok'], { queryParams: { [key]: value }, queryParamsHandling: 'merge' });
  }

  protected clearFilters(): void {
    this.router.navigate(['/foglalasok']);
  }

  protected close(): void {
    this.router.navigate(['/foglalasok'], { queryParamsHandling: 'preserve' });
  }

  private rememberVenues(list: AdminBooking[]): void {
    const known = this.seenVenues();
    if (list.every((b) => known.has(b.venueSlug))) return;
    const next = new Map(known);
    for (const b of list) next.set(b.venueSlug, b.venueName);
    this.seenVenues.set(next);
  }
}
