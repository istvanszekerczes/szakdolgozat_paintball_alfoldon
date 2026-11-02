import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { BookingApi } from './booking-api';
import { Venue } from './booking.models';

const SZEGED: Venue = {
  slug: 'szeged',
  city: 'Szeged',
  name: 'Boszorkánysziget',
  indoor: false,
  address: 'Szeged',
  latitude: 46.2,
  longitude: 20.1,
  minHeadcount: 10,
  maxHeadcount: 150,
};

describe('BookingApi', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the venue list', async () => {
    const venues = TestBed.runInInjectionContext(() => TestBed.inject(BookingApi).venues());
    TestBed.tick();
    http.expectOne('/api/venues').flush([SZEGED]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(venues.value()).toEqual([SZEGED]);
  });

  it('asks for availability only when both venue and date are known', async () => {
    const slug = signal('');
    const date = signal('');
    TestBed.runInInjectionContext(() =>
      TestBed.inject(BookingApi).availability(
        () => slug(),
        () => date(),
      ),
    );
    TestBed.tick();
    http.expectNone(() => true);

    slug.set('szeged-csarnok');
    date.set('2026-11-20');
    TestBed.tick();
    const req = http.expectOne((r) => r.url === '/api/venues/szeged-csarnok/availability');
    expect(req.request.params.get('date')).toBe('2026-11-20');
    req.flush({ venueSlug: 'szeged-csarnok', date: '2026-11-20', bookable: true, slots: [] });
  });

  it('posts a booking', async () => {
    const pending = TestBed.inject(BookingApi).create({
      venueSlug: 'szeged',
      date: '2026-11-20',
      startTime: '10:00:00',
      headcount: 20,
      name: 'Teszt Elek',
      email: 'teszt@pelda.hu',
      phone: '+36 30 123 4567',
      note: null,
    });
    const req = http.expectOne('/api/bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.headcount).toBe(20);
    req.flush({ id: 7, status: 'PENDING' });
    await expect(pending).resolves.toMatchObject({ id: 7 });
  });
});
