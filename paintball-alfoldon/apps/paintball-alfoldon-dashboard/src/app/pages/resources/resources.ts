import { Component, OnInit, inject, signal } from '@angular/core';
import { CarsService } from '../../core/cars.service';
import { Car, CarInput } from '../../core/models';
import { errorMessage } from '../../core/api';
import { Column, DataTable } from '../../shared/data-table';
import { FormDialog } from '../../shared/form-dialog';
import { StatusBadge } from '../../shared/status-badge';

const EMPTY: CarInput = { plate: '', seats: 5, active: true };

/** Erőforrások: cars for now; equipment stock (készlet, palackküszöb) comes later. */
@Component({
  selector: 'app-resources',
  imports: [DataTable, FormDialog, StatusBadge],
  template: `
    <header class="page-head">
      <div>
        <h1>Erőforrások</h1>
        <p class="muted">Autók · {{ loading() ? 'Betöltés…' : cars().length + ' autó' }}</p>
      </div>
      <button class="btn btn-primary" type="button" (click)="openNew()">+ Új autó</button>
    </header>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    <app-data-table label="Autók listája" [columns]="columns" [rows]="cars().length" [loading]="loading()" [minWidth]="480" emptyText="Még nincs autó felvéve.">
      @for (c of cars(); track c.id) {
        <tr [class.inactive]="!c.active">
          <td class="mono plate">{{ c.plate }}</td>
          <td class="num">{{ c.seats }}</td>
          <td><app-status-badge [label]="c.active ? 'Aktív' : 'Inaktív'" [tone]="c.active ? 'ok' : 'muted'" /></td>
          <td class="actions-cell"><button class="btn btn-ghost btn-sm" type="button" (click)="openEdit(c)">Szerkesztés</button></td>
        </tr>
      }
    </app-data-table>

    <section class="card soon">
      <h2>Felszerelés-készlet</h2>
      <p class="muted">Hamarosan: puskák, maszkok, palackok készlete és a palack-küszöb figyelmeztetés.</p>
    </section>

    <app-form-dialog [open]="formOpen()" [title]="editing() ? 'Autó szerkesztése' : 'Új autó'" [busy]="busy()" [error]="formError()" (save)="save()" (closed)="formOpen.set(false)">
      <div class="form-row">
        <label class="field">
          Rendszám
          <input class="input mono" required maxlength="20" autocomplete="off" placeholder="ABC-123" [value]="form().plate" (input)="set('plate', value($event))" />
        </label>
        <label class="field">
          Férőhely (sofőrrel)
          <input class="input" type="number" min="1" max="60" required [value]="form().seats" (input)="set('seats', +value($event))" />
        </label>
      </div>
      <label class="check">
        <input type="checkbox" [checked]="form().active" (change)="set('active', $any($event.target).checked)" />
        Aktív (beosztható)
      </label>
    </app-form-dialog>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 20px; }
    .plate { font-weight: 600; }
    .soon { max-width: 560px; }
    .soon p { margin: 8px 0 0; }
  `,
})
export class ResourcesPage implements OnInit {
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
