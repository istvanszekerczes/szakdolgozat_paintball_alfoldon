import { PHONE_PATTERN, formatDate, isoDateFromToday } from './booking-rules';

describe('booking rules', () => {
  it('counts days from today in local time, across month ends', () => {
    expect(isoDateFromToday(7, new Date(2026, 9, 28))).toBe('2026-11-04');
    expect(isoDateFromToday(365, new Date(2026, 10, 2))).toBe('2027-11-02');
  });

  it('accepts the same phone numbers as the backend', () => {
    expect(PHONE_PATTERN.test('+36 30 123 4567')).toBe(true);
    expect(PHONE_PATTERN.test('06-30/123-4567')).toBe(true);
    expect(PHONE_PATTERN.test('12345')).toBe(false);
    expect(PHONE_PATTERN.test('hívj fel')).toBe(false);
    expect(PHONE_PATTERN.test('((((((()))')).toBe(false);
    expect(PHONE_PATTERN.test('        ')).toBe(false);
  });

  it('formats dates in Hungarian', () => {
    expect(formatDate('2026-11-12')).toContain('november 12.');
  });
});
