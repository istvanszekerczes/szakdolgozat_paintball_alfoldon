/** Bookings as the backend's admin API returns them (see AdminBookingResponse.java). */
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface AdminBooking {
  id: number;
  venueSlug: string;
  venueName: string;
  /** ISO date, e.g. 2026-11-10 */
  date: string;
  /** Local time, e.g. 10:00:00 */
  startTime: string;
  endTime: string;
  headcount: number;
  note: string | null;
  status: BookingStatus;
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  updatedAt: string;
  /** Assignment (beosztás): null / empty until an admin assigns a car and staff. */
  car: { id: number; plate: string; seats: number } | null;
  employees: { id: number; name: string }[];
}

export interface BookingFilter {
  venue?: string;
  from?: string;
  to?: string;
  status?: BookingStatus;
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Függő',
  ACCEPTED: 'Elfogadva',
  REJECTED: 'Elutasítva',
  CANCELLED: 'Lemondva',
};

/** Mirrors BookingStatus.canChangeTo on the backend. */
export const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
};
