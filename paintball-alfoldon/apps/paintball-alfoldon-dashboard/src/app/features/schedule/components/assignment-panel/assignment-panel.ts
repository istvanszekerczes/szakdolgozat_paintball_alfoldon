import { Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { EmployeeService } from '../../../employees/services/employee-service';
import { ScheduleService } from '../../services/schedule-service';
import { AdminBooking } from '../../../bookings/models/booking';
import { EMPLOYMENT_LABELS } from '../../../employees/models/employee';
import { errorMessage } from '../../../../shared/utils/error-message';

/**
 * Staff of one game; the car is shown, but the backend assigns it automatically. The backend
 * checks clashes (travel and setup included) and absences, and answers 409 with a readable message,
 * which is shown here as is.
 */
@Component({
  selector: 'app-assignment-panel',
  templateUrl: './assignment-panel.html',
  styleUrl: './assignment-panel.scss',
})
export class AssignmentPanel implements OnInit {
  private employeeService = inject(EmployeeService);
  private scheduleService = inject(ScheduleService);

  readonly booking = input.required<AdminBooking>();
  readonly updated = output<AdminBooking>();

  protected readonly labels = EMPLOYMENT_LABELS;
  protected readonly employees = this.employeeService.employees;
  protected readonly loading = computed(() => this.employeeService.employeesLoading());
  protected readonly busy = signal(false);
  /** A refused save (clash, absence), or else a failed load of the staff. */
  private readonly saveError = signal<string | null>(null);
  protected readonly error = computed(
    () => this.saveError() ?? this.employeeService.employeesError(),
  );
  protected readonly saved = signal(false);

  protected readonly employeeIds = signal(new Set<number>());

  protected readonly employeeOptions = computed(() => {
    const assigned = new Set(this.booking().employees.map((e) => e.id));
    return this.employees().filter((e) => e.active || assigned.has(e.id));
  });

  protected readonly dirty = computed(() => {
    const b = this.booking();
    const ids = this.employeeIds();
    return b.employees.length !== ids.size || b.employees.some((e) => !ids.has(e.id));
  });

  constructor() {
    // Start from what is saved whenever another booking is opened or the saved one comes back.
    effect(() => {
      const b = this.booking();
      this.employeeIds.set(new Set(b.employees.map((e) => e.id)));
      this.saveError.set(null);
    });
  }

  ngOnInit(): void {
    this.employeeService.loadEmployees();
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
    this.saveError.set(null);
    this.saved.set(false);
    this.scheduleService.assign(this.booking(), [...this.employeeIds()]).subscribe({
      next: (b) => {
        this.busy.set(false);
        this.saved.set(true);
        this.updated.emit(b);
      },
      error: (err) => {
        this.busy.set(false);
        this.saveError.set(errorMessage(err));
      },
    });
  }
}
