import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EmployeesService } from '../../core/employees.service';
import { EMPLOYMENT_LABELS, Employee, EmployeeInput, EmploymentType, Exclusion } from '../../core/models';
import { errorMessage } from '../../core/api';
import { longDay, today } from '../../core/format';
import { Column, DataTable } from '../../shared/data-table';
import { FormDialog } from '../../shared/form-dialog';
import { StatusBadge } from '../../shared/status-badge';

const EMPTY: EmployeeInput = { name: '', phone: '', employmentType: 'FULL_TIME', active: true };

/** Alkalmazottak: list, new / edit in a dialog, absences (távollétek) in a second dialog. */
@Component({
  selector: 'app-employees',
  imports: [DataTable, FormDialog, StatusBadge],
  templateUrl: './employees.html',
  styles: `
    :host { display: flex; flex-direction: column; gap: 20px; }
    .name { font-weight: 600; }
    .actions-cell .btn + .btn { margin-left: 6px; }
    .filter { display: flex; align-items: center; gap: 16px; }
    .x-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .x-list li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line); }
    .x-list .grow { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .x-list .past { opacity: 0.6; }
    .sub { font-size: 13px; color: var(--fg-2); margin: 0; }
    h3 { margin: 6px 0 0; font-size: 14px; }
  `,
})
export class EmployeesPage implements OnInit {
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
