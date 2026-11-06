import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Availability,
  BookingCreated,
  CreateBookingRequest,
  Venue,
} from '../../features/booking/models/booking';

/**
 * The only class that knows the backend's endpoints. Every other file asks this one for data.
 */
@Service()
export class BackendCommunicator {
  private http = inject(HttpClient);
  /** Empty in development (the dev server proxies `/api`) and when the API shares the site's origin. */
  private apiUrl = environment.apiUrl.replace(/\/+$/, '') + '/api';

  //       ---   Venue related communications   ---

  public loadVenues() {
    return this.http.get<Venue[]>(`${this.apiUrl}/venues`);
  }

  public loadAvailability(venueSlug: string, date: string) {
    return this.http.get<Availability>(
      `${this.apiUrl}/venues/${encodeURIComponent(venueSlug)}/availability`,
      { params: { date } },
    );
  }

  //       ---   Booking related communications   ---

  public createBooking(request: CreateBookingRequest) {
    return this.http.post<BookingCreated>(`${this.apiUrl}/bookings`, request);
  }
}
