/**
 * Client-side copy of the backend booking rules (`app.booking.*` in application.properties), used to
 * limit the date picker and to explain a refusal before the request is sent. The backend stays the
 * authority: it checks every rule again.
 */
export const MIN_DAYS_IN_ADVANCE = 7;
export const MAX_DAYS_IN_ADVANCE = 365;
export const NOTE_MAX_LENGTH = 1000;
/** Same pattern as `CreateBookingRequest.phone` on the backend: phone characters, at least 6 digits. */
export const PHONE_PATTERN = /^(?=(?:\D*\d){6})[+0-9 ()/-]{6,30}$/;

export const PHONE_DISPLAY = '+36 30/977 14 86';
export const PHONE_HREF = 'tel:+36309771486';

/** `today + days` as `YYYY-MM-DD` in the visitor's local time zone. */
export function isoDateFromToday(days: number, today = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Long date in the given locale, e.g. `2026. november 12., csütörtök` in Hungarian or
 * `Thursday 12 November 2026` in English.
 */
export function formatDate(iso: string, locale = 'hu-HU'): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(y, m - 1, d));
}
