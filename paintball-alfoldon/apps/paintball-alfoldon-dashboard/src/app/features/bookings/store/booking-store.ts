import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { AdminBooking, BookingFilter, BookingStatus } from '../models/booking';

type BookingState = {
  /** The bookings of the page in view (list filter, calendar range or schedule day). */
  bookings: AdminBooking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  /** Every pending booking, for the overview and the badge in the side menu. */
  pendingBookings: AdminBooking[];
  pendingLoading: boolean;
  pendingError: string | null;
  pendingCount: number | null;
};

const initialState: BookingState = {
  bookings: [],
  bookingsLoading: false,
  bookingsError: null,
  pendingBookings: [],
  pendingLoading: false,
  pendingError: null,
  pendingCount: null,
};

const replaceIn = (list: AdminBooking[], updated: AdminBooking) =>
  list.map((b) => (b.id === updated.id ? updated : b));

export const BookingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('bookings'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  //withMethods for the core functions of the store.
  withMethods(({ backendCommunicator, ...store }) => ({
    loadBookings: rxMethod<BookingFilter>(
      pipe(
        // Cleared first: the list may still hold another page's bookings (other filter or range).
        tap(() => patchState(store, { bookings: [], bookingsLoading: true, bookingsError: null })),
        switchMap((filter) =>
          backendCommunicator.loadBookings(filter).pipe(
            tapResponse({
              next: (bookings) => patchState(store, { bookings, bookingsLoading: false }),
              error: (err) =>
                patchState(store, { bookingsLoading: false, bookingsError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    loadPendingBookings: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { pendingLoading: true, pendingError: null })),
        switchMap(() =>
          backendCommunicator.loadBookings({ status: 'PENDING' }).pipe(
            tapResponse({
              next: (pendingBookings) =>
                patchState(store, {
                  pendingBookings,
                  pendingCount: pendingBookings.length,
                  pendingLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  pendingCount: null,
                  pendingLoading: false,
                  pendingError: errorMessage(err),
                }),
            }),
          ),
        ),
      ),
    ),

    /** Puts a booking that changed somewhere else (side panel, assignment) into the lists. */
    replaceBooking(updated: AdminBooking) {
      patchState(store, (state) => ({
        bookings: replaceIn(state.bookings, updated),
        pendingBookings: replaceIn(state.pendingBookings, updated),
      }));
    },

    loadBooking(id: number): Observable<AdminBooking> {
      return backendCommunicator.loadBooking(id);
    },
  })),

  //withMethods for the functions that are using the store's other functions.
  withMethods(({ backendCommunicator, ...store }) => ({
    changeStatus(id: number, status: BookingStatus): Observable<AdminBooking> {
      return backendCommunicator.changeBookingStatus(id, status).pipe(
        tap((updated) => {
          store.replaceBooking(updated);
          store.loadPendingBookings();
        }),
      );
    },
  })),
);
