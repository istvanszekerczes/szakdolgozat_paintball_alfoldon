import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EmployeeService } from '../../services/employee-service';
import { EMPLOYMENT_LABELS, Employee, EmployeeInput, EmploymentType, Exclusion } from '../../models/employee';
import { errorMessage } from '../../../../shared/utils/error-message';
import { longDay, today } from '../../../../shared/utils/format';
import { Column, DataTable } from '../../../../shared/components/data-table/data-table';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

const EMPTY: EmployeeInput = { name: '', phone: '', employmentType: 'FULL_TIME', active: true };

/** Alkalmazottak: list, new / edit in a dialog, absences (távollétek) in a second dialog. */
@Component({
  selector: 'app-employees',
  imports: [DataTable, FormDialog, StatusBadge],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees implements OnInit {
  private employeeService = inject(EmployeeService);

  protected readonly labels = EMPLOYMENT_LABELS;
  protected readonly types: EmploymentType[] = ['FULL_TIME', 'ON_CALL'];
  protected readonly longDay = longDay;
  protected readonly today = today();
  protected readonly columns: Column[] = [
    { label: 'Név' },
    { label: 'Telefon' },
    { label: 'Foglalkoztatás' },
    { label: 'Állapot' },
    { label: '' },
  ];

  protected readonly list = this.employeeService.employees;
  protected readonly loading = this.employeeService.employeesLoading;
  /** A failed (de)activation, or else a failed load. */
  private readonly actionError = signal<string | null>(null);
  protected readonly error = computed(
    () => this.actionError() ?? this.employeeService.employeesError(),
  );
  protected readonly showInactive = signal(false);
  protected readonly visible = computed(() => this.list().filter((e) => e.active || this.showInactive()));
  protected readonly inactiveCount = computed(() => this.list().filter((e) => !e.active).length);

  // Edit dialog
  protected readonly editing = signal<Employee | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly form = signal<EmployeeInput>({ ...EMPTY });
  protected readonly formBusy = signal(false);
  protected readonly formError = signal<string | null>(null);

  // Absences dialog
  protected readonly absenceOf = signal<Employee | null>(null);
  protected readonly exclusions = this.employeeService.exclusions;
  protected readonly exclusionForm = signal({ dateFrom: '', dateTo: '', reason: '' });
  protected readonly exclusionBusy = signal(false);
  /** A refused or invalid absence, or else a failed load of the list. */
  private readonly exclusionActionError = signal<string | null>(null);
  protected readonly exclusionError = computed(
    () => this.exclusionActionError() ?? this.employeeService.exclusionsError(),
  );

  ngOnInit(): void {
    this.employeeService.loadEmployees();
  }

  protected openNew(): void {
    this.editing.set(null);
    this.form.set({ ...EMPTY });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(e: Employee): void {
    this.editing.set(e);
    this.form.set({ name: e.name, phone: e.phone ?? '', employmentType: e.employmentType, active: e.active });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected set<K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected save(): void {
    const editing = this.editing();
    const input = { ...this.form(), phone: this.form().phone?.trim() || null };
    this.formBusy.set(true);
    this.formError.set(null);
    this.employeeService.saveEmployee(editing?.id ?? null, input).subscribe({
      next: () => {
        this.formBusy.set(false);
        this.formOpen.set(false);
      },
      error: (err) => {
        this.formBusy.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  /** Deactivating replaces deleting: past assignments keep pointing at the employee. */
  protected toggleActive(e: Employee): void {
    if (e.active && !confirm(`${e.name} inaktív lesz, és nem lehet többé beosztani. Folytatod?`)) return;
    const { id, ...input } = e;
    this.actionError.set(null);
    this.employeeService.saveEmployee(id, { ...input, active: !e.active }).subscribe({
      error: (err) => this.actionError.set(errorMessage(err)),
    });
  }

  protected openAbsences(e: Employee): void {
    this.absenceOf.set(e);
    this.exclusionForm.set({ dateFrom: '', dateTo: '', reason: '' });
    this.exclusionActionError.set(null);
    this.employeeService.loadExclusions(e.id);
  }

  protected setExclusion(key: 'dateFrom' | 'dateTo' | 'reason', event: Event): void {
    const value = this.value(event);
    this.exclusionForm.update((f) => ({
      ...f,
      [key]: value,
      // A one-day absence is the common case: fill the end with the start.
      ...(key === 'dateFrom' && !f.dateTo ? { dateTo: value } : {}),
    }));
  }

  protected addExclusion(): void {
    const e = this.absenceOf();
    const f = this.exclusionForm();
    if (!e) return;
    if (!f.dateFrom || !f.dateTo) {
      this.exclusionActionError.set('Add meg az első és az utolsó napot.');
      return;
    }
    this.exclusionBusy.set(true);
    this.exclusionActionError.set(null);
    const input = { dateFrom: f.dateFrom, dateTo: f.dateTo, reason: f.reason.trim() || null };
    this.employeeService.addExclusion(e.id, input).subscribe({
      next: () => {
        this.exclusionBusy.set(false);
        this.exclusionForm.set({ dateFrom: '', dateTo: '', reason: '' });
      },
      error: (err) => {
        this.exclusionBusy.set(false);
        this.exclusionActionError.set(errorMessage(err));
      },
    });
  }

  protected deleteExclusion(x: Exclusion): void {
    const e = this.absenceOf();
    if (!e) return;
    this.employeeService.deleteExclusion(e.id, x.id).subscribe({
      error: (err) => this.exclusionActionError.set(errorMessage(err)),
    });
  }

}
