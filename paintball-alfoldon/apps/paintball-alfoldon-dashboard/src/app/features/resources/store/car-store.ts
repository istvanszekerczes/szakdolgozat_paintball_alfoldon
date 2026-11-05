import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { Car, CarInput } from '../models/car';

type CarState = {
  cars: Car[];
  carsLoading: boolean;
  carsError: string | null;
};

const initialState: CarState = {
  cars: [],
  carsLoading: false,
  carsError: null,
};

export const CarStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('cars'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  //withMethods for the core functions of the store.
  withMethods(({ backendCommunicator, ...store }) => ({
    loadCars: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { carsLoading: true })),
        switchMap(() =>
          backendCommunicator.loadCars().pipe(
            tapResponse({
              next: (cars) => patchState(store, { cars, carsLoading: false, carsError: null }),
              error: (err) => patchState(store, { carsLoading: false, carsError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),
  })),

  //withMethods for the functions that are using the store's other functions.
  withMethods(({ backendCommunicator, ...store }) => ({
    /** Creates the car when id is null, otherwise updates it; then reloads the list. */
    saveCar(id: number | null, input: CarInput): Observable<Car> {
      const request =
        id === null ? backendCommunicator.createCar(input) : backendCommunicator.updateCar(id, input);
      return request.pipe(tap(() => store.loadCars()));
    },
  })),
);
