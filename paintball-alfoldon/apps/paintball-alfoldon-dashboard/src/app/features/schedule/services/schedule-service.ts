import { Service, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AdminBooking } from '../../bookings/models/booking';
import { BookingService } from '../../bookings/services/booking-service';
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

  /**
   * Loads the alerts the backend computed for the coming days.
   *
   * @returns void
   */
  loadAlerts() {
    this.store.loadAlerts();
  }

  /**
   * Saves the car and the staff of one game, then updates the booking lists and the day plan.
   *
   * @param booking The game to assign.
   * @param carId The ID of the car, or null for no car.
   * @param employeeIds The IDs of the employees working on the game.
   * @returns An Observable of the updated booking.
   */
  assign(booking: AdminBooking, carId: number | null, employeeIds: number[]): Observable<AdminBooking> {
    return this.store.assign(booking.id, carId, employeeIds).pipe(
      tap((updated) => {
        this.bookingService.replaceBooking(updated);
        if (this.store.daySchedule()?.date === updated.date) {
          this.store.refreshDaySchedule(updated.date);
        }
      }),
    );
  }
}
