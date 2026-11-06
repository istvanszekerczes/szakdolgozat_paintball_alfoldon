import { Service, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Car, CarInput } from '../models/car';
import { CarStore } from '../store/car-store';

/** Erőforrások: the cars that take the equipment and the staff to the venues. */
@Service()
export class CarService {
  private store = inject(CarStore);

  readonly cars = computed(() => this.store.cars());
  readonly carsLoading = computed(() => this.store.carsLoading());
  readonly carsError = computed(() => this.store.carsError());

  /**
   * Loads every car, inactive ones included.
   *
   * @returns void
   */
  loadCars() {
    this.store.loadCars();
  }

  /**
   * Creates a new car or updates an existing one, then reloads the list.
   *
   * @param id The ID of the car to update, or null for a new one.
   * @param input Plate, seats and the active flag.
   * @returns An Observable of the saved car.
   */
  saveCar(id: number | null, input: CarInput): Observable<Car> {
    return this.store.saveCar(id, input);
  }
}
