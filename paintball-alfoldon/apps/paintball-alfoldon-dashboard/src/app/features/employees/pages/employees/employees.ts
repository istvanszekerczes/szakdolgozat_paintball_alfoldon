import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EmployeesService } from '../../services/employee-service';
import { EMPLOYMENT_LABELS, Employee, EmployeeInput, EmploymentType, Exclusion } from '../../../bookings/models/booking';
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
  private readonly api = inject(EmployeesService);

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

  protected readonly list = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
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
  protected readonly exclusions = signal<Exclusion[]>([]);
  protected readonly exclusionForm = signal({ dateFrom: '', dateTo: '', reason: '' });
  protected readonly exclusionBusy = signal(false);
  protected readonly exclusionError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
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
    (editing ? this.api.update(editing.id, input) : this.api.create(input)).subscribe({
      next: () => {
        this.formBusy.set(false);
        this.formOpen.set(false);
        this.load();
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
    this.api.update(id, { ...input, active: !e.active }).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected openAbsences(e: Employee): void {
    this.absenceOf.set(e);
    this.exclusions.set([]);
    this.exclusionForm.set({ dateFrom: '', dateTo: '', reason: '' });
    this.exclusionError.set(null);
    this.api.exclusions(e.id).subscribe({
      next: (list) => this.exclusions.set(list),
      error: (err) => this.exclusionError.set(errorMessage(err)),
    });
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
      this.exclusionError.set('Add meg az első és az utolsó napot.');
      return;
    }
    this.exclusionBusy.set(true);
    this.exclusionError.set(null);
    this.api.addExclusion(e.id, { dateFrom: f.dateFrom, dateTo: f.dateTo, reason: f.reason.trim() || null }).subscribe({
      next: (x) => {
        this.exclusionBusy.set(false);
        this.exclusions.update((list) => [x, ...list].sort((a, b) => b.dateFrom.localeCompare(a.dateFrom)));
        this.exclusionForm.set({ dateFrom: '', dateTo: '', reason: '' });
      },
      error: (err) => {
        this.exclusionBusy.set(false);
        this.exclusionError.set(errorMessage(err));
      },
    });
  }

  protected deleteExclusion(x: Exclusion): void {
    const e = this.absenceOf();
    if (!e) return;
    this.api.deleteExclusion(e.id, x.id).subscribe({
      next: () => this.exclusions.update((list) => list.filter((y) => y.id !== x.id)),
      error: (err) => this.exclusionError.set(errorMessage(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (list) => {
        this.list.set(list);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
