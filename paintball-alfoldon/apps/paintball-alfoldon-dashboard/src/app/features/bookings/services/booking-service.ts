import { Service, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminBooking, BookingFilter, BookingStatus } from '../models/booking';
import { BookingStore } from '../store/booking-store';

@Service()
export class BookingService {
  private store = inject(BookingStore);

  readonly bookings = computed(() => this.store.bookings());
  readonly bookingsLoading = computed(() => this.store.bookingsLoading());
  readonly bookingsError = computed(() => this.store.bookingsError());

  readonly pendingBookings = computed(() => this.store.pendingBookings());
  readonly pendingLoading = computed(() => this.store.pendingLoading());
  readonly pendingError = computed(() => this.store.pendingError());
  /** Number of pending bookings, shown as a badge in the side menu. */
  readonly pendingCount = computed(() => this.store.pendingCount());

  /**
   * Loads the bookings that match the filter. A newer call cancels the one still running.
   *
   * @param filter Venue, date range and status; empty fields are left out.
   * @returns void
   */
  loadBookings(filter: BookingFilter) {
    this.store.loadBookings(filter);
  }

  /**
   * Loads every pending booking and refreshes the badge in the side menu.
   *
   * @returns void
   */
  loadPendingBookings() {
    this.store.loadPendingBookings();
  }

  /**
   * Loads one booking, also when it is not in the list in view.
   *
   * @param id The ID of the booking.
   * @returns An Observable of the booking.
   */
  loadBooking(id: number): Observable<AdminBooking> {
    return this.store.loadBooking(id);
  }

  /**
   * Accepts, rejects or cancels a booking, then updates the lists and the badge.
   *
   * @param id The ID of the booking.
   * @param status The new status; the backend allows only the steps in NEXT_STATUSES.
   * @returns An Observable of the updated booking.
   */
  changeStatus(id: number, status: BookingStatus): Observable<AdminBooking> {
    return this.store.changeStatus(id, status);
  }

  /**
   * Puts a booking that changed somewhere else into the lists.
   *
   * @param updated The booking as the backend returned it.
   * @returns void
   */
  replaceBooking(updated: AdminBooking) {
    this.store.replaceBooking(updated);
  }
}
