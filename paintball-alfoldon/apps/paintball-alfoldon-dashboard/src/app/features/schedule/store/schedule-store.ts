import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { AdminBooking } from '../../bookings/models/booking';
import { Alert, DaySchedule } from '../models/schedule';

type ScheduleState = {
  /** The day plan of one date: car timeline and who works. */
  daySchedule: DaySchedule | null;
  dayScheduleLoading: boolean;
  dayScheduleError: string | null;
  /** Computed by the backend, most severe first. */
  alerts: Alert[];
  alertsLoading: boolean;
  alertsError: string | null;
};

const initialState: ScheduleState = {
  daySchedule: null,
  dayScheduleLoading: false,
  dayScheduleError: null,
  alerts: [],
  alertsLoading: false,
  alertsError: null,
};

export const ScheduleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('schedule'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  withMethods(({ backendCommunicator, ...store }) => ({
    loadDaySchedule: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            daySchedule: null,
            dayScheduleLoading: true,
            dayScheduleError: null,
          }),
        ),
        switchMap((date) =>
          backendCommunicator.loadDaySchedule(date).pipe(
            tapResponse({
              next: (daySchedule) => patchState(store, { daySchedule, dayScheduleLoading: false }),
              error: (err) =>
                patchState(store, {
                  dayScheduleLoading: false,
                  dayScheduleError: errorMessage(err),
                }),
            }),
          ),
        ),
      ),
    ),

    // Reloads the plan in place, so the timeline does not blink to "Betöltés…" after a save.
    refreshDaySchedule: rxMethod<string>(
      pipe(
        switchMap((date) =>
          backendCommunicator.loadDaySchedule(date).pipe(
            tapResponse({
              next: (daySchedule) => patchState(store, { daySchedule }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    loadAlerts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { alertsLoading: true, alertsError: null })),
        switchMap(() =>
          backendCommunicator.loadAlerts().pipe(
            tapResponse({
              next: (alerts) => patchState(store, { alerts, alertsLoading: false }),
              error: (err) =>
                patchState(store, { alertsLoading: false, alertsError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    assign(
      bookingId: number,
      carId: number | null,
      employeeIds: number[],
    ): Observable<AdminBooking> {
      return backendCommunicator.assignBooking(bookingId, carId, employeeIds);
    },
  })),
);
