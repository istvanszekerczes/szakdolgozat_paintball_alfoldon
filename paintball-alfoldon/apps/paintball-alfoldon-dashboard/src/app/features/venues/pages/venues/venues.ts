import { Component, OnInit, inject, signal } from '@angular/core';
import { VenueSettings, VenuesService } from '../../services/venue-service';
import { AdminVenue, VenueBlock } from '../../../bookings/models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import { today } from '../../../../shared/utils/format';
import { Column, DataTable } from '../../../../shared/components/data-table/data-table';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

/** Pályák: active switch, travel / setup / teardown minutes (they drive the schedule) and blocks. */
@Component({
  selector: 'app-venues',
  imports: [DataTable, FormDialog, StatusBadge],
  templateUrl: './venues.html',
  styleUrl: './venues.scss',
})
export class Venues implements OnInit {
  private readonly api = inject(VenuesService);

  protected readonly columns: Column[] = [
    { label: 'Pálya' },
    { label: 'Típus' },
    { label: 'Létszám', num: true },
    { label: 'Út Szegedről', num: true },
    { label: 'Ki- / elpakolás', num: true },
    { label: 'Állapot' },
    { label: '' },
  ];

  protected readonly venues = signal<AdminVenue[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly editing = signal<AdminVenue | null>(null);
  protected readonly form = signal<VenueSettings>({ active: true, travelMinutes: 0, setupMinutes: 45, teardownMinutes: 30 });
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly blocksOf = signal<AdminVenue | null>(null);
  protected readonly blocks = signal<VenueBlock[]>([]);
  protected readonly blockForm = signal({ date: '', from: '08:00', toDate: '', to: '20:00', reason: '' });
  protected readonly blockBusy = signal(false);
  protected readonly blockError = signal<string | null>(null);
  protected readonly today = today();

  ngOnInit(): void {
    this.load();
  }

  protected openEdit(v: AdminVenue): void {
    this.editing.set(v);
    this.form.set({ active: v.active, travelMinutes: v.travelMinutes, setupMinutes: v.setupMinutes, teardownMinutes: v.teardownMinutes });
    this.formError.set(null);
  }

  protected setNum(key: 'travelMinutes' | 'setupMinutes' | 'teardownMinutes', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected setActive(event: Event): void {
    const active = (event.target as HTMLInputElement).checked;
    this.form.update((f) => ({ ...f, active }));
  }

  protected save(): void {
    const v = this.editing();
    if (!v) return;
    this.busy.set(true);
    this.formError.set(null);
    this.api.update(v.id, this.form()).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.editing.set(null);
        this.venues.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      },
      error: (err) => {
        this.busy.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  protected toggleActive(v: AdminVenue): void {
    if (v.active && !confirm(`A(z) ${v.name} pálya inaktív lesz, és nem lehet rá foglalni. Folytatod?`)) return;
    const { active, travelMinutes, setupMinutes, teardownMinutes } = v;
    this.api.update(v.id, { active: !active, travelMinutes, setupMinutes, teardownMinutes }).subscribe({
      next: (updated) => this.venues.update((list) => list.map((x) => (x.id === updated.id ? updated : x))),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected openBlocks(v: AdminVenue): void {
    this.blocksOf.set(v);
    this.blocks.set([]);
    this.blockError.set(null);
    this.blockForm.set({ date: '', from: '08:00', toDate: '', to: '20:00', reason: '' });
    this.api.blocks(v.id).subscribe({
      next: (list) => this.blocks.set(list),
      error: (err) => this.blockError.set(errorMessage(err)),
    });
  }

  protected setBlock(key: 'date' | 'from' | 'toDate' | 'to' | 'reason', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.blockForm.update((f) => ({ ...f, [key]: value, ...(key === 'date' && !f.toDate ? { toDate: value } : {}) }));
  }

  protected addBlock(): void {
    const v = this.blocksOf();
    const f = this.blockForm();
    if (!v) return;
    if (!f.date || !f.toDate || !f.from || !f.to) {
      this.blockError.set('Add meg a zárolás kezdetét és végét.');
      return;
    }
    this.blockBusy.set(true);
    this.blockError.set(null);
    const block = { startsAt: `${f.date}T${f.from}:00`, endsAt: `${f.toDate}T${f.to}:00`, reason: f.reason.trim() || null };
    this.api.addBlock(v.id, block).subscribe({
      next: (b) => {
        this.blockBusy.set(false);
        this.blocks.update((list) => [...list, b].sort((x, y) => x.startsAt.localeCompare(y.startsAt)));
        this.blockForm.set({ date: '', from: '08:00', toDate: '', to: '20:00', reason: '' });
      },
      error: (err) => {
        this.blockBusy.set(false);
        this.blockError.set(errorMessage(err));
      },
    });
  }

  protected deleteBlock(b: VenueBlock): void {
    const v = this.blocksOf();
    if (!v) return;
    this.api.deleteBlock(v.id, b.id).subscribe({
      next: () => this.blocks.update((list) => list.filter((x) => x.id !== b.id)),
      error: (err) => this.blockError.set(errorMessage(err)),
    });
  }

  /** "2026-11-10T09:00:00" → "nov. 10. 9:00" */
  protected when(dateTime: string): string {
    return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
      new Date(dateTime),
    );
  }

  private load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (list) => {
        this.venues.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
