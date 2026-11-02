import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Venue } from '../data/booking.models';
import { MIN_DAYS_IN_ADVANCE, isoDateFromToday } from '../data/booking-rules';
import { BookingWizard } from './booking-wizard';

const VENUES: Venue[] = [
  {
    slug: 'szeged',
    city: 'Szeged',
    name: 'Boszorkánysziget',
    indoor: false,
    address: 'Szeged',
    latitude: 46.2,
    longitude: 20.1,
    minHeadcount: 10,
    maxHeadcount: 150,
  },
  {
    slug: 'kecskemet',
    city: 'Kecskemét',
    name: 'Homokbánya',
    indoor: true,
    address: 'Kecskemét',
    latitude: 46.9,
    longitude: 19.6,
    minHeadcount: 10,
    maxHeadcount: 150,
  },
];

const DAY = isoDateFromToday(MIN_DAYS_IN_ADVANCE + 3);

describe('BookingWizard', () => {
  let fixture: ComponentFixture<BookingWizard>;
  let http: HttpTestingController;
  let el: HTMLElement;

  async function setup(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [BookingWizard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      ],
    });
    fixture = TestBed.createComponent(BookingWizard);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
    // A pending httpResource keeps the app unstable, so answer it before waiting for stability.
    TestBed.tick();
    http.expectOne('/api/venues').flush(VENUES);
    await fixture.whenStable();
  }

  const heading = () => el.querySelector('h2')?.textContent ?? '';
  const button = (text: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.includes(text))!;

  async function type(selector: string, value: string) {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    TestBed.tick();
  }

  async function click(text: string) {
    button(text).click();
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
  }

  /** Lets the submit promise chain (HttpClient → submit() → wizard) run to the end. */
  async function settle() {
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve));
      TestBed.tick();
    }
  }

  afterEach(() => http.verify());

  it('lists the venues and moves on when one is picked', async () => {
    await setup();
    expect(heading()).toContain('Melyik pályán');
    expect(el.querySelectorAll('.venue').length).toBe(2);

    await click('Homokbánya');
    expect(heading()).toContain('Mikor jönnétek');
  });

  it('preselects the venue from ?palya=', async () => {
    await setup({ palya: 'szeged' });
    expect(heading()).toContain('Mikor jönnétek');
  });

  it('does not move on without a date and a slot', async () => {
    await setup({ palya: 'szeged' });
    await click('Tovább');
    expect(heading()).toContain('Mikor jönnétek');
    expect(el.textContent).toContain('Válassz dátumot.');
  });

  it('books a slot end to end', async () => {
    await setup({ palya: 'szeged' });

    await type('#bw-date', DAY);
    http.expectOne((r) => r.url === '/api/venues/szeged/availability').flush({
      venueSlug: 'szeged',
      date: DAY,
      bookable: true,
      slots: [
        { start: '08:00:00', end: '10:00:00', available: false },
        { start: '10:00:00', end: '12:00:00', available: true },
      ],
    });
    await fixture.whenStable();
    expect(button('08:00–').disabled).toBe(true);
    await click('10:00–');
    await click('Tovább');

    expect(heading()).toContain('Hányan');
    await type('#bw-headcount', '5');
    await click('Tovább');
    expect(el.textContent).toContain('legalább 10 fő');
    await type('#bw-headcount', '24');
    await click('Tovább');

    expect(heading()).toContain('Kapcsolattartó');
    await type('#bw-name', 'Teszt Elek');
    await type('#bw-email', 'teszt@pelda.hu');
    await type('#bw-phone', '+36 30 123 4567');
    await click('Tovább');

    expect(heading()).toContain('Ellenőrizd');
    expect(el.textContent).toContain('Helyszínen fizetendő');
    await click('Foglalás elküldése');

    const req = http.expectOne('/api/bookings');
    expect(req.request.body).toEqual({
      venueSlug: 'szeged',
      date: DAY,
      startTime: '10:00:00',
      headcount: 24,
      name: 'Teszt Elek',
      email: 'teszt@pelda.hu',
      phone: '+36 30 123 4567',
      note: null,
    });
    req.flush({
      id: 42,
      venueSlug: 'szeged',
      venueName: 'Boszorkánysziget',
      date: DAY,
      startTime: '10:00:00',
      endTime: '12:00:00',
      headcount: 24,
      status: 'PENDING',
    });
    await settle();
    expect(el.textContent).toContain('Foglalásodat megkaptuk');
    expect(el.textContent).toContain('#42');
  });

  it('refuses a fractional headcount and a blank name', async () => {
    await setup({ palya: 'szeged' });
    await type('#bw-date', DAY);
    http.expectOne((r) => r.url.endsWith('/availability')).flush({
      venueSlug: 'szeged',
      date: DAY,
      bookable: true,
      slots: [{ start: '10:00:00', end: '12:00:00', available: true }],
    });
    await fixture.whenStable();
    await click('10:00');
    await click('Tovább');

    await type('#bw-headcount', '10.5');
    await click('Tovább');
    expect(heading()).toContain('Hányan');
    expect(el.textContent).toContain('egész szám');

    await type('#bw-headcount', '20');
    await click('Tovább');
    await type('#bw-name', '    ');
    await type('#bw-email', 'teszt@pelda.hu');
    await type('#bw-phone', '+36 30 123 4567');
    await click('Tovább');
    expect(heading()).toContain('Kapcsolattartó');
    expect(el.textContent).toContain('Add meg a neved.');
  });

  it('sends the visitor back to the slots when the slot was taken meanwhile', async () => {
    await setup({ palya: 'szeged' });
    await type('#bw-date', DAY);
    const slots = { venueSlug: 'szeged', date: DAY, bookable: true, slots: [{ start: '10:00:00', end: '12:00:00', available: true }] };
    http.expectOne((r) => r.url.endsWith('/availability')).flush(slots);
    await fixture.whenStable();
    await click('10:00');
    await click('Tovább');
    await type('#bw-headcount', '24');
    await click('Tovább');
    await type('#bw-name', 'Teszt Elek');
    await type('#bw-email', 'teszt@pelda.hu');
    await type('#bw-phone', '+36 30 123 4567');
    await click('Tovább');
    await click('Foglalás elküldése');

    http
      .expectOne('/api/bookings')
      .flush({ detail: 'Ez az időpont már foglalt.' }, { status: 409, statusText: 'Conflict' });
    await settle();
    http.expectOne((r) => r.url.endsWith('/availability')).flush({
      ...slots,
      slots: [{ ...slots.slots[0], available: false }, { start: '12:00:00', end: '14:00:00', available: true }],
    });
    await fixture.whenStable();

    expect(heading()).toContain('Mikor jönnétek');
    expect(el.textContent).toContain('Ez az időpont már foglalt.');

    await click('12:00–');
    expect(el.textContent).not.toContain('Ez az időpont már foglalt.');
  });
});
