import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { Employee, EmployeeInput, Exclusion } from '../models/employee';

type EmployeeState = {
  employees: Employee[];
  employeesLoading: boolean;
  employeesError: string | null;
  /** Absences of the employee whose dialog is open, newest first. */
  exclusions: Exclusion[];
  exclusionsError: string | null;
};

const initialState: EmployeeState = {
  employees: [],
  employeesLoading: false,
  employeesError: null,
  exclusions: [],
  exclusionsError: null,
};

export const EmployeeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('employees'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  //withMethods for the core functions of the store.
  withMethods(({ backendCommunicator, ...store }) => ({
    loadEmployees: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { employeesLoading: true })),
        switchMap(() =>
          backendCommunicator.loadEmployees().pipe(
            tapResponse({
              next: (employees) =>
                patchState(store, { employees, employeesLoading: false, employeesError: null }),
              error: (err) =>
                patchState(store, { employeesLoading: false, employeesError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    loadExclusions: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { exclusions: [], exclusionsError: null })),
        switchMap((employeeId) =>
          backendCommunicator.loadExclusions(employeeId).pipe(
            tapResponse({
              next: (exclusions) => patchState(store, { exclusions }),
              error: (err) => patchState(store, { exclusionsError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    addExclusion(employeeId: number, input: Omit<Exclusion, 'id'>): Observable<Exclusion> {
      return backendCommunicator.addExclusion(employeeId, input).pipe(
        tap((exclusion) =>
          patchState(store, (state) => ({
            exclusions: [exclusion, ...state.exclusions].sort((a, b) =>
              b.dateFrom.localeCompare(a.dateFrom),
            ),
          })),
        ),
      );
    },

    deleteExclusion(employeeId: number, exclusionId: number): Observable<void> {
      return backendCommunicator.deleteExclusion(employeeId, exclusionId).pipe(
        tap(() =>
          patchState(store, (state) => ({
            exclusions: state.exclusions.filter((x) => x.id !== exclusionId),
          })),
        ),
      );
    },
  })),

  //withMethods for the functions that are using the store's other functions.
  withMethods(({ backendCommunicator, ...store }) => ({
    /** Creates the employee when id is null, otherwise updates it; then reloads the list. */
    saveEmployee(id: number | null, input: EmployeeInput): Observable<Employee> {
      const request =
        id === null
          ? backendCommunicator.createEmployee(input)
          : backendCommunicator.updateEmployee(id, input);
      return request.pipe(tap(() => store.loadEmployees()));
    },
  })),
);
