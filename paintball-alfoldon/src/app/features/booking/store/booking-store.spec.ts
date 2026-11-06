import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookingStore } from './booking-store';

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

  it('asks for availability only when both venue and date are known', () => {
    store.loadAvailability({ venueSlug: 'szeged', date: '' });
    http.expectNone(() => true);
    expect(store.availabilityLoading()).toBe(false);

    store.loadAvailability({ venueSlug: 'szeged', date: '2026-11-20' });
    expect(store.availabilityLoading()).toBe(true);
    http
      .expectOne((r) => r.url === '/api/venues/szeged/availability')
      .flush({ venueSlug: 'szeged', date: '2026-11-20', bookable: true, slots: [] });
    expect(store.availabilityLoading()).toBe(false);
    expect(store.availability()?.bookable).toBe(true);
  });

  it('keeps only the answer for the last picked day', () => {
    store.loadAvailability({ venueSlug: 'szeged', date: '2026-11-20' });
    store.loadAvailability({ venueSlug: 'szeged', date: '2026-11-21' });
    const [first, second] = http.match((r) => r.url === '/api/venues/szeged/availability');
    expect(first.cancelled).toBe(true);
    second.flush({ venueSlug: 'szeged', date: '2026-11-21', bookable: true, slots: [] });
    expect(store.availability()?.date).toBe('2026-11-21');
  });

  it('marks a failed venue list', () => {
    store.loadVenues();
    http.expectOne('/api/venues').flush('down', { status: 500, statusText: 'Server Error' });
    expect(store.venuesError()).toBe(true);
    expect(store.venuesLoading()).toBe(false);
  });
});
