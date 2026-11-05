import { Component, OnInit, inject, signal } from '@angular/core';
import { CarsService } from '../../services/car-service';
import { Car, CarInput } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import { Column, DataTable } from '../../../../shared/components/data-table/data-table';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

const EMPTY: CarInput = { plate: '', seats: 5, active: true };

/** Erőforrások: cars for now; equipment stock (készlet, palackküszöb) comes later. */
@Component({
  selector: 'app-resources',
  imports: [DataTable, FormDialog, StatusBadge],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources implements OnInit {
  private readonly api = inject(CarsService);

  protected readonly columns: Column[] = [{ label: 'Rendszám' }, { label: 'Férőhely', num: true }, { label: 'Állapot' }, { label: '' }];
  protected readonly cars = signal<Car[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly editing = signal<Car | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly form = signal<CarInput>({ ...EMPTY });
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected openNew(): void {
    this.editing.set(null);
    this.form.set({ ...EMPTY });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(car: Car): void {
    this.editing.set(car);
    this.form.set({ plate: car.plate, seats: car.seats, active: car.active });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected set<K extends keyof CarInput>(key: K, value: CarInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected save(): void {
    const editing = this.editing();
    this.busy.set(true);
    this.formError.set(null);
    (editing ? this.api.update(editing.id, this.form()) : this.api.create(this.form())).subscribe({
      next: () => {
        this.busy.set(false);
        this.formOpen.set(false);
        this.load();
      },
      error: (err) => {
        this.busy.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
