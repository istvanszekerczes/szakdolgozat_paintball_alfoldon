import { EmploymentType } from '../../employees/models/employee';

/** The computed day plan and the alerts built on it (see ScheduleController.java, AlertController.java). */
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
