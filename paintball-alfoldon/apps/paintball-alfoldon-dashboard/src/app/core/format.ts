/** Date helpers. Booking dates are local (Europe/Budapest) ISO dates like 2026-11-10. */

export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return isoDate(new Date());
}

/** "10:00:00" → "10:00" */
export function hm(time: string): string {
  return time.slice(0, 5);
}

/** "okt. 31., péntek" */
export function longDay(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric', weekday: 'long' }).format(
    parseDate(iso),
  );
}

/** "2026. október 27., kedd" */
export function fullDate(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(parseDate(iso));
}

/** Short weekday, e.g. "K", "Sze" */
export function shortDow(iso: string): string {
  const names = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
  return names[parseDate(iso).getDay()];
}

/** "ma 8:12", "tegnap 16:40", "3 napja" */
export function relative(instant: string): string {
  const t = new Date(instant);
  const days = Math.floor((parseDate(today()).getTime() - parseDate(isoDate(t)).getTime()) / 86_400_000);
  const time = t.toLocaleTimeString('hu-HU', { hour: 'numeric', minute: '2-digit' });
  if (days <= 0) return `ma ${time}`;
  if (days === 1) return `tegnap ${time}`;
  return `${days} napja`;
}

export function hoursSince(instant: string): number {
  return (Date.now() - new Date(instant).getTime()) / 3_600_000;
}
