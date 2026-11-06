import { TestBed } from '@angular/core/testing';
import { LocationService } from './location-service';

/** `min_headcount` and `max_headcount` from the backend's V2__seed_venues.sql, which the wizard enforces. */
const DATABASE_LIMITS: Record<string, [number, number]> = {
  szeged: [10, 150],
  'szeged-csarnok': [8, 100],
  szentes: [10, 100],
  szolnok: [10, 300],
  kecskemet: [10, 150],
  bekescsaba: [10, 120],
  oroshaza: [10, 150],
};

describe('LocationService', () => {
  const service = () => TestBed.inject(LocationService);

  it('has the same group limits as the database', () => {
    const limits = Object.fromEntries(
      service()
        .getLocations()
        .map((l) => [l.id, [l.minHeadcount, l.maxHeadcount]]),
    );
    expect(limits).toEqual(DATABASE_LIMITS);
  });

  it('recommends group sizes inside the limits', () => {
    for (const l of service().getLocations()) {
      const [from, to] = l.optHeadcount.split('–').map(Number);
      expect(from, l.id).toBeGreaterThanOrEqual(l.minHeadcount);
      expect(to, l.id).toBeLessThanOrEqual(l.maxHeadcount);
    }
  });

  it('gives the real overall group range', () => {
    expect(service().getGroupRange()).toEqual({ min: 8, max: 300 });
  });
});
