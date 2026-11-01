import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { AdminBooking, Alert, DaySchedule } from './models';

/** Beosztás: assignments, the computed day plan and the alerts built on them. */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly api = `${inject(API_URL)}/api/admin`;

  /** Replaces the car and staff of a game; 409 with a message when someone is elsewhere or away. */
  assign(bookingId: number, carId: number | null, employeeIds: number[]): Observable<AdminBooking> {
    return this.http.put<AdminBooking>(`${this.api}/bookings/${bookingId}/assignment`, { carId, employeeIds });
  }

  day(date: string): Observable<DaySchedule> {
    return this.http.get<DaySchedule>(`${this.api}/schedule`, { params: { date } });
  }

  alerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.api}/alerts`);
  }
}
