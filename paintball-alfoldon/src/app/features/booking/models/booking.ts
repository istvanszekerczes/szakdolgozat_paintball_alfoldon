/** Shapes of the public booking API (`paintball-alfoldon-backend`, packages `venue` and `booking`). */

export interface Venue {
  slug: string;
  city: string;
  name: string;
  indoor: boolean;
  address: string;
  latitude: number;
  longitude: number;
  minHeadcount: number;
  maxHeadcount: number;
}

export interface AvailabilitySlot {
  /** Local time as the API sends it, e.g. `08:00:00`. Sent back unchanged when booking. */
  start: string;
  end: string;
  available: boolean;
}

export interface Availability {
  venueSlug: string;
  date: string;
  /** False for the whole day when it is inside the one-week rule or too far ahead. */
  bookable: boolean;
  slots: AvailabilitySlot[];
}

/** Everything the wizard collects; the Signal Form model. */
export interface BookingDraft {
  venueSlug: string;
  /** `YYYY-MM-DD`, as a native date input gives it. */
  date: string;
  startTime: string;
  headcount: number | null;
  note: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateBookingRequest {
  venueSlug: string;
  date: string;
  startTime: string;
  headcount: number;
  name: string;
  email: string;
  phone: string;
  note: string | null;
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface BookingCreated {
  id: number;
  venueSlug: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  headcount: number;
  status: BookingStatus;
}

export const EMPTY_DRAFT: BookingDraft = {
  venueSlug: '',
  date: '',
  startTime: '',
  headcount: null,
  note: '',
  name: '',
  email: '',
  phone: '',
};

/** `08:00:00` → `08:00`. */
export function shortTime(time: string): string {
  return time.slice(0, 5);
}

export function toRequest(draft: BookingDraft): CreateBookingRequest {
  return {
    venueSlug: draft.venueSlug,
    date: draft.date,
    startTime: draft.startTime,
    headcount: draft.headcount ?? 0,
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    note: draft.note.trim() || null,
  };
}
