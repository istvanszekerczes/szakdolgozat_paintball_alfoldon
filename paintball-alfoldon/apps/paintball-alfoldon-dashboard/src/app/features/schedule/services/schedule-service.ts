import { Service, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AdminBooking } from '../../bookings/models/booking';
import { BookingService } from '../../bookings/services/booking-service';
import { ScheduleProposal } from '../models/schedule';
import { ScheduleStore } from '../store/schedule-store';

/** Beosztás: assignments, the computed day plan and the alerts built on them. */
@Service()
export class ScheduleService {
  private store = inject(ScheduleStore);
  private bookingService = inject(BookingService);

  readonly daySchedule = computed(() => this.store.daySchedule());
  readonly dayScheduleLoading = computed(() => this.store.dayScheduleLoading());
  readonly dayScheduleError = computed(() => this.store.dayScheduleError());

  readonly alerts = computed(() => this.store.alerts());
  readonly alertsLoading = computed(() => this.store.alertsLoading());
  readonly alertsError = computed(() => this.store.alertsError());

  /**
   * Loads the day plan (car timeline and staff) of one date.
   *
   * @param date The day as `YYYY-MM-DD`.
   * @returns void
   */
  loadDaySchedule(date: string) {
    this.store.loadDaySchedule(date);
  }

  readonly proposal = computed(() => this.store.proposal());
  readonly proposalLoading = computed(() => this.store.proposalLoading());
  readonly proposalError = computed(() => this.store.proposalError());

  /**
   * Loads the app's proposed car and staff for every game of one date.
   *
   * @param date The day as `YYYY-MM-DD`.
   * @returns void
   */
  loadProposal(date: string) {
    this.store.loadProposal(date);
  }

  /**
   * Saves the changed assignments of the proposal (all or none), then reloads the day.
   *
   * @param proposal The proposal the admin accepted.
   * @returns An Observable that completes when the assignments are saved.
   */
  applyProposal(proposal: ScheduleProposal): Observable<void> {
    return this.store.applyProposal(proposal).pipe(
      tap(() => {
        this.bookingService.loadBookings({
          from: proposal.date,
          to: proposal.date,
          status: 'ACCEPTED',
        });
        this.store.refreshDaySchedule(proposal.date);
        this.store.loadProposal(proposal.date);
      }),
    );
  }

  /**
   * Loads the alerts the backend computed for the coming days.
   *
   * @returns void
   */
  loadAlerts() {
    this.store.loadAlerts();
  }

  /**
   * Saves the staff of one game (its car is assigned automatically), then updates the booking lists and the day plan.
   *
   * @param booking The game to assign.
   * @param employeeIds The IDs of the employees working on the game.
   * @returns An Observable of the updated booking.
   */
  assign(booking: AdminBooking, employeeIds: number[]): Observable<AdminBooking> {
    return this.store.assign(booking.id, employeeIds).pipe(
      tap((updated) => {
        this.bookingService.replaceBooking(updated);
        if (this.store.daySchedule()?.date === updated.date) {
          this.store.refreshDaySchedule(updated.date);
        }
        if (this.store.proposal()?.date === updated.date) {
          this.store.loadProposal(updated.date);
        }
      }),
    );
  }
}
