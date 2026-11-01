import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Employee, EmployeeInput, Exclusion } from './models';

/** Staff (Alkalmazottak). Employees are never deleted, only saved with active=false. */
@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/api/admin/employees`;

  list(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.base);
  }

  create(input: EmployeeInput): Observable<Employee> {
    return this.http.post<Employee>(this.base, input);
  }

  update(id: number, input: EmployeeInput): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/${id}`, input);
  }

  exclusions(id: number): Observable<Exclusion[]> {
    return this.http.get<Exclusion[]>(`${this.base}/${id}/exclusions`);
  }

  addExclusion(id: number, input: Omit<Exclusion, 'id'>): Observable<Exclusion> {
    return this.http.post<Exclusion>(`${this.base}/${id}/exclusions`, input);
  }

  deleteExclusion(id: number, exclusionId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/exclusions/${exclusionId}`);
  }
}
