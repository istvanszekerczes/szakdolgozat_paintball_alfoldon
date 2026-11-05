import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Schedule } from './schedule';

describe('Schedule', () => {
  it('shows the current day again when the date field is cleared', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(Schedule);
    fixture.componentRef.setInput('datum', '2027-03-16');
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .match(() => true)
      .forEach((req) => req.flush(req.request.url.includes('schedule') ? { date: '2027-03-16', cars: [], staff: [] } : []));
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    expect(input.value).toBe('2027-03-16');

    input.value = '';
    input.dispatchEvent(new Event('change'));
    expect(input.value).toBe('2027-03-16');
  });
});
