/** Turns an HTTP error from the backend (RFC 9457 problem or plain status) into a Hungarian message. */
export function errorMessage(error: unknown): string {
  const e = error as { status?: number; error?: { detail?: string; message?: string; errors?: Record<string, string> } };
  // 400 from bean validation: the field messages say more than "Hibás adatok."
  const fieldErrors = Object.values(e?.error?.errors ?? {});
  if (fieldErrors.length) return fieldErrors.join(' ');
  if (e?.error?.detail) return e.error.detail;
  if (e?.status === 0) return 'A szerver nem érhető el. Fut a backend a localhost:8080-on?';
  if (e?.status === 401) return 'Lejárt a bejelentkezés, jelentkezz be újra.';
  if (e?.status === 403) return 'Ehhez nincs jogosultságod.';
  return 'Váratlan hiba történt.';
}
