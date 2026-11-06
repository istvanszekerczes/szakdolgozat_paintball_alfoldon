import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, finalize, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { Availability, BookingCreated, CreateBookingRequest, Venue } from '../models/booking';

type BookingState = {
  venues: Venue[];
  venuesLoading: boolean;
  venuesError: boolean;
  /** The venue and day the slots belong to; empty while either is unknown. */
  availabilityQuery: AvailabilityQuery;
  availability: Availability | null;
  availabilityLoading: boolean;
  availabilityError: boolean;
  sending: boolean;
  created: BookingCreated | null;
};

export type AvailabilityQuery = {
  venueSlug: string;
  date: string;
};

const initialState: BookingState = {
  venues: [],
  venuesLoading: false,
  venuesError: false,
  availabilityQuery: { venueSlug: '', date: '' },
  availability: null,
  availabilityLoading: false,
  availabilityError: false,
  sending: false,
  created: null,
};

export const BookingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('booking'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  withMethods(({ backendCommunicator, ...store }) => ({
    loadVenues: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { venuesLoading: true, venuesError: false })),
        switchMap(() =>
          backendCommunicator.loadVenues().pipe(
            tapResponse({
              next: (venues) => patchState(store, { venues, venuesLoading: false }),
              error: () => patchState(store, { venuesLoading: false, venuesError: true }),
            }),
          ),
        ),
      ),
    ),

    // switchMap drops the answer for a venue or day the visitor has already left.
    loadAvailability: rxMethod<AvailabilityQuery>(
      pipe(
        tap((query) =>
          patchState(store, {
            availabilityQuery: query,
            availability: null,
            availabilityError: false,
            availabilityLoading: !!query.venueSlug && !!query.date,
          }),
        ),
        switchMap((query) => {
          if (!query.venueSlug || !query.date) return [];
          return backendCommunicator.loadAvailability(query.venueSlug, query.date).pipe(
            tapResponse({
              next: (availability) =>
                patchState(store, { availability, availabilityLoading: false }),
              error: () =>
                patchState(store, { availabilityLoading: false, availabilityError: true }),
            }),
          );
        }),
      ),
    ),

    createBooking(request: CreateBookingRequest): Observable<BookingCreated> {
      patchState(store, { sending: true });
      return backendCommunicator.createBooking(request).pipe(
        tap((created) => patchState(store, { created })),
        finalize(() => patchState(store, { sending: false })),
      );
    },

    clearCreated() {
      patchState(store, { created: null });
    },
  })),
);
