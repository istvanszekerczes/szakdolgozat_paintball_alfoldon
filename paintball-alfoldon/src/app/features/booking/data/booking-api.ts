import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Availability, BookingCreated, CreateBookingRequest, Venue } from './booking.models';

/**
 * Public booking endpoints. The resource factories must be called in an injection context
 * (a component field initializer), like `httpResource` itself.
 */
@Service()
export class BookingApi {
  private readonly http = inject(HttpClient);
  /** Empty in development (the dev server proxies `/api`) and when the API shares the site's origin. */
  private readonly base = environment.apiUrl.replace(/\/+$/, '');

  venues() {
    return httpResource<Venue[]>(() => `${this.base}/api/venues`, { defaultValue: [] });
  }

  /** Reloads whenever the venue or the date changes; idle while either is empty. */
  availability(venueSlug: () => string, date: () => string) {
    return httpResource<Availability>(() => {
      const slug = venueSlug();
      const day = date();
      if (!slug || !day) return undefined;
      return { url: `${this.base}/api/venues/${encodeURIComponent(slug)}/availability`, params: { date: day } };
    });
  }

  create(request: CreateBookingRequest): Promise<BookingCreated> {
    return firstValueFrom(this.http.post<BookingCreated>(`${this.base}/api/bookings`, request));
  }
}
