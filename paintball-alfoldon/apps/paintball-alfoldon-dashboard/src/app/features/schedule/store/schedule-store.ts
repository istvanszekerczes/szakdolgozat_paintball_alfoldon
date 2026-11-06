import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { AdminBooking } from '../../bookings/models/booking';
import { Alert, DaySchedule, ScheduleProposal } from '../models/schedule';

type ScheduleState = {
  /** The day plan of one date: car timeline and who works. */
  daySchedule: DaySchedule | null;
  dayScheduleLoading: boolean;
  dayScheduleError: string | null;
  /** Computed by the backend, most severe first. */
  alerts: Alert[];
  alertsLoading: boolean;
  alertsError: string | null;
  /** The app's proposed car and staff for every game of the day. */
  proposal: ScheduleProposal | null;
  proposalLoading: boolean;
  proposalError: string | null;
};

const initialState: ScheduleState = {
  daySchedule: null,
  dayScheduleLoading: false,
  dayScheduleError: null,
  alerts: [],
  alertsLoading: false,
  alertsError: null,
  proposal: null,
  proposalLoading: false,
  proposalError: null,
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

    loadProposal: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { proposalLoading: true, proposalError: null })),
        switchMap((date) =>
          backendCommunicator.loadProposal(date).pipe(
            tapResponse({
              next: (proposal) => patchState(store, { proposal, proposalLoading: false }),
              error: (err) =>
                patchState(store, {
                  proposal: null,
                  proposalLoading: false,
                  proposalError: errorMessage(err),
                }),
            }),
          ),
        ),
      ),
    ),

    applyProposal(proposal: ScheduleProposal): Observable<void> {
      return backendCommunicator.applyProposal(
        proposal.games
          .filter((g) => g.changed)
          .map((g) => ({
            bookingId: g.bookingId,
            employeeIds: g.staff.map((s) => s.id),
          })),
      );
    },

    assign(bookingId: number, employeeIds: number[]): Observable<AdminBooking> {
      return backendCommunicator.assignBooking(bookingId, employeeIds);
    },
  })),
);
