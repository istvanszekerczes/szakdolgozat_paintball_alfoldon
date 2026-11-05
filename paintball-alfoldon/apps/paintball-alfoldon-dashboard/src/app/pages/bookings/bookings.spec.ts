import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingsPage } from './bookings';

const BOOKING = {
  id: 1,
  venueSlug: 'szeged',
  venueName: 'Boszorkánysziget',
  date: '2027-03-01',
  startTime: '10:00:00',
  endTime: '12:00:00',
  headcount: 20,
  status: 'ACCEPTED',
  customer: { name: 'Teszt Elek', email: 'teszt@pelda.hu', phone: '+36 30 123 4567' },
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
  employees: [],
};

describe('BookingsPage', () => {
  it('shows the filters of a deep link in the dropdowns', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(BookingsPage);
    const http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('status', 'ACCEPTED');
    fixture.componentRef.setInput('venue', 'szeged');
    TestBed.tick();
    http.match(() => true).forEach((req) => req.flush([BOOKING]));
    await fixture.whenStable();

    const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    expect(selects[0].value).toBe('ACCEPTED');
    expect(selects[1].value).toBe('szeged');
  });

  it('keeps the clear button in place, disabled until a filter is set', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(BookingsPage);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
    const button = () => fixture.nativeElement.querySelector('button.clear') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    fixture.componentRef.setInput('status', 'PENDING');
    TestBed.tick();
    http.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
    expect(button().disabled).toBe(false);
  });
});
