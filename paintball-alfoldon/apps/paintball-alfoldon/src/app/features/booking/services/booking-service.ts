import { Service, Signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateBookingRequest, BookingCreated } from '../models/booking';
import { AvailabilityQuery, BookingStore } from '../store/booking-store';

/**
 * The booking wizard's entry point to the booking state. Components use this service and never
 * the store or the backend directly.
 */
@Service()
export class BookingService {
  private store = inject(BookingStore);

  readonly venues = computed(() => this.store.venues());
  readonly venuesLoading = computed(() => this.store.venuesLoading());
  readonly venuesError = computed(() => this.store.venuesError());

  readonly availability = computed(() => this.store.availability());
  readonly availabilityLoading = computed(() => this.store.availabilityLoading());
  readonly availabilityError = computed(() => this.store.availabilityError());

  readonly sending = computed(() => this.store.sending());
  readonly created = computed(() => this.store.created());

  /**
   * Loads the list of bookable venues.
   *
   * @returns void
   */
  loadVenues() {
    this.store.loadVenues();
  }

  /**
   * Keeps the free slots in sync with the picked venue and day. Nothing is requested while
   * either of them is empty. Must be called in an injection context (a component constructor),
   * so the subscription ends with the component.
   *
   * @param query The venue slug and the `YYYY-MM-DD` date to load the slots for.
   * @returns void
   */
  watchAvailability(query: Signal<AvailabilityQuery>) {
    this.store.loadAvailability(query);
  }

  /**
   * Loads the free slots again for the venue and day already picked.
   *
   * @returns void
   */
  reloadAvailability() {
    this.store.loadAvailability({ ...this.store.availabilityQuery() });
  }

  /**
   * Sends a booking to the backend and remembers the answer.
   *
   * @param request The booking, as the backend's `CreateBookingRequest` expects it.
   * @returns An Observable of the created (pending) booking.
   */
  createBooking(request: CreateBookingRequest): Observable<BookingCreated> {
    return this.store.createBooking(request);
  }

  /**
   * Forgets the last created booking, so the wizard can start over.
   *
   * @returns void
   */
  clearCreated() {
    this.store.clearCreated();
  }
}
