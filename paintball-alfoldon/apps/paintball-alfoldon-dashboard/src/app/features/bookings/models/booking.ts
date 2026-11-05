/** Shapes returned by the backend's admin API (see AdminBookingResponse.java, TokenService.java). */

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

export interface LoginResponse {
  token: string;
  expiresAt: string;
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

// --- Staff, cars and the daily schedule (EmployeeController, CarController, ScheduleController) ---

export type EmploymentType = 'FULL_TIME' | 'ON_CALL';

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Főállású',
  ON_CALL: 'Beugrós',
};

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  employmentType: EmploymentType;
  active: boolean;
}

export type EmployeeInput = Omit<Employee, 'id'>;

export interface Exclusion {
  id: number;
  dateFrom: string;
  dateTo: string;
  reason: string | null;
}

export interface Car {
  id: number;
  plate: string;
  seats: number;
  active: boolean;
}

export type CarInput = Omit<Car, 'id'>;

export type SegmentType = 'TRAVEL_OUT' | 'SETUP' | 'GAME' | 'TEARDOWN' | 'TRAVEL_BETWEEN' | 'TRAVEL_HOME';

export const SEGMENT_LABELS: Record<SegmentType, string> = {
  TRAVEL_OUT: 'Odaút',
  SETUP: 'Kipakolás',
  GAME: 'Játék',
  TEARDOWN: 'Elpakolás',
  TRAVEL_BETWEEN: 'Köztes út',
  TRAVEL_HOME: 'Hazaút',
};

export interface Segment {
  type: SegmentType;
  start: string;
  end: string;
  bookingId: number;
  venueName: string;
}

export interface DaySchedule {
  date: string;
  cars: { carId: number; plate: string; seats: number; segments: Segment[] }[];
  staff: {
    employeeId: number;
    name: string;
    phone: string | null;
    employmentType: EmploymentType;
    from: string;
    to: string;
    cars: string[];
    venues: string[];
    excluded: boolean;
  }[];
  unassigned: { bookingId: number; venueName: string; startTime: string; endTime: string; hasCar: boolean; hasStaff: boolean }[];
}

export interface Alert {
  type: 'PENDING_SOON' | 'LONG_PENDING' | 'UNASSIGNED' | 'EMPLOYEE_AWAY' | 'VENUE_BLOCKED';
  severity: 'DANGER' | 'WARN';
  title: string;
  detail: string;
  bookingId: number;
  date: string;
}

// --- Venues on the dashboard (AdminVenueController) ---

export interface AdminVenue {
  id: number;
  slug: string;
  city: string;
  name: string;
  indoor: boolean;
  address: string;
  minHeadcount: number;
  maxHeadcount: number;
  active: boolean;
  travelMinutes: number;
  setupMinutes: number;
  teardownMinutes: number;
}

export interface VenueBlock {
  id: number;
  /** Local date-time, e.g. 2026-11-10T09:00:00 */
  startsAt: string;
  endsAt: string;
  reason: string | null;
}
