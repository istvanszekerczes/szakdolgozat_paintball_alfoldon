import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { BackendCommunicator } from './backend-communicator';
import { Venue } from '../../features/booking/models/booking';

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

describe('BackendCommunicator', () => {
  let http: HttpTestingController;
  let backendCommunicator: BackendCommunicator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    backendCommunicator = TestBed.inject(BackendCommunicator);
  });

  afterEach(() => http.verify());

  it('loads the venue list', async () => {
    const venues = firstValueFrom(backendCommunicator.loadVenues());
    http.expectOne('/api/venues').flush([SZEGED]);
    await expect(venues).resolves.toEqual([SZEGED]);
  });

  it('asks for the availability of one venue on one day', () => {
    backendCommunicator.loadAvailability('szeged-csarnok', '2026-11-20').subscribe();
    const req = http.expectOne((r) => r.url === '/api/venues/szeged-csarnok/availability');
    expect(req.request.params.get('date')).toBe('2026-11-20');
    req.flush({ venueSlug: 'szeged-csarnok', date: '2026-11-20', bookable: true, slots: [] });
  });

  it('posts a booking', async () => {
    const created = firstValueFrom(
      backendCommunicator.createBooking({
        venueSlug: 'szeged',
        date: '2026-11-20',
        startTime: '10:00:00',
        headcount: 20,
        name: 'Teszt Elek',
        email: 'teszt@pelda.hu',
        phone: '+36 30 123 4567',
        note: null,
      }),
    );
    const req = http.expectOne('/api/bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.headcount).toBe(20);
    req.flush({ id: 7, status: 'PENDING' });
    await expect(created).resolves.toMatchObject({ id: 7 });
  });
});
