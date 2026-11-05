import { Service, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee, EmployeeInput, Exclusion } from '../models/employee';
import { EmployeeStore } from '../store/employee-store';

/** Staff (Alkalmazottak). Employees are never deleted, only saved with active=false. */
@Service()
export class EmployeeService {
  private store = inject(EmployeeStore);

  readonly employees = computed(() => this.store.employees());
  readonly employeesLoading = computed(() => this.store.employeesLoading());
  readonly employeesError = computed(() => this.store.employeesError());
  readonly exclusions = computed(() => this.store.exclusions());
  readonly exclusionsError = computed(() => this.store.exclusionsError());

  /**
   * Loads every employee, inactive ones included.
   *
   * @returns void
   */
  loadEmployees() {
    this.store.loadEmployees();
  }

  /**
   * Creates a new employee or updates an existing one, then reloads the list.
   *
   * @param id The ID of the employee to update, or null for a new one.
   * @param input Name, phone, employment type and the active flag.
   * @returns An Observable of the saved employee.
   */
  saveEmployee(id: number | null, input: EmployeeInput): Observable<Employee> {
    return this.store.saveEmployee(id, input);
  }

  /**
   * Loads the absences of one employee.
   *
   * @param employeeId The ID of the employee.
   * @returns void
   */
  loadExclusions(employeeId: number) {
    this.store.loadExclusions(employeeId);
  }

  /**
   * Adds an absence: the employee cannot be assigned to games on these days.
   *
   * @param employeeId The ID of the employee.
   * @param input First and last day and an optional reason.
   * @returns An Observable of the saved absence.
   */
  addExclusion(employeeId: number, input: Omit<Exclusion, 'id'>): Observable<Exclusion> {
    return this.store.addExclusion(employeeId, input);
  }

  /**
   * Deletes an absence.
   *
   * @param employeeId The ID of the employee.
   * @param exclusionId The ID of the absence.
   * @returns An Observable that completes when the absence is deleted.
   */
  deleteExclusion(employeeId: number, exclusionId: number): Observable<void> {
    return this.store.deleteExclusion(employeeId, exclusionId);
  }
}
