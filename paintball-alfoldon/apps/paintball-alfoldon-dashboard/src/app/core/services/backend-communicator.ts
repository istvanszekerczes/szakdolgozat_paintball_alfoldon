import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { SKIPS_AUTH } from '../interceptors/skips-auth';
import { LoginResponse } from '../../features/auth/models/auth';
import { AdminBooking, BookingFilter, BookingStatus } from '../../features/bookings/models/booking';
import { Employee, EmployeeInput, Exclusion } from '../../features/employees/models/employee';
import { Car, CarInput } from '../../features/resources/models/car';
import { Alert, DaySchedule, ScheduleProposal } from '../../features/schedule/models/schedule';
import { AdminVenue, VenueBlock, VenueSettings } from '../../features/venues/models/venue';

/** Base URL of the backend. Locally the API runs on :8080 and allows the dashboard origin :4300. */
const API_URL = 'http://localhost:8080';

/**
 * The only class that knows the backend's endpoints. Stores and services ask this one for data.
 */
@Service()
export class BackendCommunicator {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/api/admin`;

  //       ---   Auth related communications   ---

  public login(credentials: { username: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, {
      context: new HttpContext().set(SKIPS_AUTH, true),
    });
  }

  public changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<void>(`${this.apiUrl}/auth/password`, { currentPassword, newPassword });
  }

  //       ---   Booking related communications   ---

  public loadBookings(filter: BookingFilter = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<AdminBooking[]>(`${this.apiUrl}/bookings`, { params });
  }

  public loadBooking(id: number) {
    return this.http.get<AdminBooking>(`${this.apiUrl}/bookings/${id}`);
  }

  public changeBookingStatus(id: number, status: BookingStatus) {
    return this.http.patch<AdminBooking>(`${this.apiUrl}/bookings/${id}/status`, { status });
  }

  /** Replaces the staff of a game (the car is automatic); 409 with a message when someone is elsewhere or away. */
  public assignBooking(id: number, employeeIds: number[]) {
    return this.http.put<AdminBooking>(`${this.apiUrl}/bookings/${id}/assignment`, { employeeIds });
  }

  //       ---   Schedule related communications   ---

  public loadDaySchedule(date: string) {
    return this.http.get<DaySchedule>(`${this.apiUrl}/schedule`, { params: { date } });
  }

  public loadProposal(date: string) {
    return this.http.get<ScheduleProposal>(`${this.apiUrl}/schedule/proposal`, {
      params: { date },
    });
  }

  /** Saves every assignment of the proposal, or none of them when one is refused (409). */
  public applyProposal(items: { bookingId: number; employeeIds: number[] }[]) {
    return this.http.post<void>(`${this.apiUrl}/schedule/proposal/apply`, items);
  }

  public loadAlerts() {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`);
  }

  //       ---   Employee related communications   ---

  public loadEmployees() {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  public createEmployee(input: EmployeeInput) {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, input);
  }

  public updateEmployee(id: number, input: EmployeeInput) {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}`, input);
  }

  public loadExclusions(employeeId: number) {
    return this.http.get<Exclusion[]>(`${this.apiUrl}/employees/${employeeId}/exclusions`);
  }

  public addExclusion(employeeId: number, input: Omit<Exclusion, 'id'>) {
    return this.http.post<Exclusion>(`${this.apiUrl}/employees/${employeeId}/exclusions`, input);
  }

  public deleteExclusion(employeeId: number, exclusionId: number) {
    return this.http.delete<void>(
      `${this.apiUrl}/employees/${employeeId}/exclusions/${exclusionId}`,
    );
  }

  //       ---   Car related communications   ---

  public loadCars() {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`);
  }

  public createCar(input: CarInput) {
    return this.http.post<Car>(`${this.apiUrl}/cars`, input);
  }

  public updateCar(id: number, input: CarInput) {
    return this.http.put<Car>(`${this.apiUrl}/cars/${id}`, input);
  }

  //       ---   Venue related communications   ---

  public loadVenues() {
    return this.http.get<AdminVenue[]>(`${this.apiUrl}/venues`);
  }

  public updateVenue(id: number, settings: VenueSettings) {
    return this.http.put<AdminVenue>(`${this.apiUrl}/venues/${id}`, settings);
  }

  public loadVenueBlocks(venueId: number) {
    return this.http.get<VenueBlock[]>(`${this.apiUrl}/venues/${venueId}/blocks`);
  }

  public addVenueBlock(venueId: number, block: Omit<VenueBlock, 'id'>) {
    return this.http.post<VenueBlock>(`${this.apiUrl}/venues/${venueId}/blocks`, block);
  }

  public deleteVenueBlock(venueId: number, blockId: number) {
    return this.http.delete<void>(`${this.apiUrl}/venues/${venueId}/blocks/${blockId}`);
  }
}
