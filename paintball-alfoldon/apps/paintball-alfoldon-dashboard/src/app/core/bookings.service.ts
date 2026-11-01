import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api';
import { AdminBooking, BookingFilter, BookingStatus } from './models';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/api/admin/bookings`;

  /** Number of pending bookings, shown as a badge in the side menu. */
  readonly pendingCount = signal<number | null>(null);

  list(filter: BookingFilter = {}): Observable<AdminBooking[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<AdminBooking[]>(this.base, { params });
  }

  get(id: number): Observable<AdminBooking> {
    return this.http.get<AdminBooking>(`${this.base}/${id}`);
  }

  changeStatus(id: number, status: BookingStatus): Observable<AdminBooking> {
    return this.http
      .patch<AdminBooking>(`${this.base}/${id}/status`, { status })
      .pipe(tap(() => this.refreshPendingCount()));
  }

  refreshPendingCount(): void {
    this.list({ status: 'PENDING' }).subscribe({
      next: (list) => this.pendingCount.set(list.length),
      error: () => this.pendingCount.set(null),
    });
  }
}
