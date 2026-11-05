import { Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CarsService } from '../../../resources/services/car-service';
import { EmployeesService } from '../../../employees/services/employee-service';
import { ScheduleService } from '../../services/schedule-service';
import { AdminBooking, Car, EMPLOYMENT_LABELS, Employee } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';

/**
 * Car + staff of one game. The backend checks clashes (travel and setup included) and absences,
 * and answers 409 with a readable message, which is shown here as is.
 */
@Component({
  selector: 'app-assignment-panel',
  templateUrl: './assignment-panel.html',
  styleUrl: './assignment-panel.scss',
})
export class AssignmentPanel implements OnInit {
  private readonly carsApi = inject(CarsService);
  private readonly employeesApi = inject(EmployeesService);
  private readonly schedule = inject(ScheduleService);

  readonly booking = input.required<AdminBooking>();
  readonly updated = output<AdminBooking>();

  protected readonly labels = EMPLOYMENT_LABELS;
  protected readonly cars = signal<Car[]>([]);
  protected readonly employees = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly carId = signal<number | null>(null);
  protected readonly employeeIds = signal(new Set<number>());

  /** Active ones, plus inactive ones that are already assigned to this game. */
  protected readonly carOptions = computed(() =>
    this.cars().filter((c) => c.active || c.id === this.booking().car?.id),
  );
  protected readonly employeeOptions = computed(() => {
    const assigned = new Set(this.booking().employees.map((e) => e.id));
    return this.employees().filter((e) => e.active || assigned.has(e.id));
  });

  protected readonly dirty = computed(() => {
    const b = this.booking();
    const ids = this.employeeIds();
    return (
      (b.car?.id ?? null) !== this.carId() ||
      b.employees.length !== ids.size ||
      b.employees.some((e) => !ids.has(e.id))
    );
  });

  constructor() {
    // Start from what is saved whenever another booking is opened or the saved one comes back.
    effect(() => {
      const b = this.booking();
      this.carId.set(b.car?.id ?? null);
      this.employeeIds.set(new Set(b.employees.map((e) => e.id)));
      this.error.set(null);
    });
  }

  ngOnInit(): void {
    forkJoin({ cars: this.carsApi.list(), employees: this.employeesApi.list() }).subscribe({
      next: ({ cars, employees }) => {
        this.cars.set(cars);
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected num(event: Event): number | null {
    const value = (event.target as HTMLSelectElement).value;
    return value ? Number(value) : null;
  }

  protected toggle(id: number): void {
    const next = new Set(this.employeeIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.employeeIds.set(next);
    this.saved.set(false);
  }

  protected save(): void {
    this.busy.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.schedule.assign(this.booking().id, this.carId(), [...this.employeeIds()]).subscribe({
      next: (b) => {
        this.busy.set(false);
        this.saved.set(true);
        this.updated.emit(b);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
