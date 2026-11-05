import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminBooking } from '../models/booking';
import { BookingStore } from './booking-store';

const PENDING: AdminBooking = {
  id: 1,
  venueSlug: 'szeged',
  venueName: 'Boszorkánysziget',
  date: '2027-03-01',
  startTime: '10:00:00',
  endTime: '12:00:00',
  headcount: 20,
  note: null,
  status: 'PENDING',
  customer: { name: 'Teszt Elek', email: 'teszt@pelda.hu', phone: '+36 30 123 4567' },
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
  car: null,
  employees: [],
};

describe('BookingStore', () => {
  let http: HttpTestingController;
  let store: InstanceType<typeof BookingStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(BookingStore);
  });

  afterEach(() => http.verify());

  it('counts the pending bookings for the side menu', () => {
    store.loadPendingBookings();
    http
      .expectOne(
        (r) => r.url.endsWith('/api/admin/bookings') && r.params.get('status') === 'PENDING',
      )
      .flush([PENDING]);
    expect(store.pendingCount()).toBe(1);
  });

  it('updates the list and the badge after a status change', () => {
    store.loadBookings({ from: '2027-03-01', to: '2027-03-07' });
    http.expectOne((r) => r.params.get('from') === '2027-03-01').flush([PENDING]);

    store.changeStatus(1, 'ACCEPTED').subscribe();
    http
      .expectOne((r) => r.url.endsWith('/bookings/1/status'))
      .flush({ ...PENDING, status: 'ACCEPTED' });
    expect(store.bookings()[0].status).toBe('ACCEPTED');

    http.expectOne((r) => r.params.get('status') === 'PENDING').flush([]);
    expect(store.pendingCount()).toBe(0);
  });

  it('keeps a readable message when the list cannot be loaded', () => {
    store.loadBookings({});
    http
      .expectOne((r) => r.url.endsWith('/bookings'))
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    expect(store.bookingsLoading()).toBe(false);
    expect(store.bookingsError()).toContain('A szerver nem érhető el');
  });
});
