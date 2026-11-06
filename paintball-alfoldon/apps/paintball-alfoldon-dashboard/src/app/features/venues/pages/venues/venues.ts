import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { VenueService } from '../../services/venue-service';
import { AdminVenue, VenueBlock, VenueSettings } from '../../models/venue';
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
  private venueService = inject(VenueService);

  protected readonly columns: Column[] = [
    { label: 'Pálya' },
    { label: 'Típus' },
    { label: 'Létszám', num: true },
    { label: 'Út Szegedről', num: true },
    { label: 'Ki- / elpakolás', num: true },
    { label: 'Állapot' },
    { label: '' },
  ];

  protected readonly venues = this.venueService.venues;
  protected readonly loading = this.venueService.venuesLoading;
  /** A failed (de)activation, or else a failed load. */
  private readonly actionError = signal<string | null>(null);
  protected readonly error = computed(() => this.actionError() ?? this.venueService.venuesError());

  protected readonly editing = signal<AdminVenue | null>(null);
  protected readonly form = signal<VenueSettings>({
    active: true,
    travelMinutes: 0,
    setupMinutes: 45,
    teardownMinutes: 30,
  });
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly blocksOf = signal<AdminVenue | null>(null);
  protected readonly blocks = this.venueService.blocks;
  protected readonly blockForm = signal({
    date: '',
    from: '08:00',
    toDate: '',
    to: '20:00',
    reason: '',
  });
  protected readonly blockBusy = signal(false);
  /** A refused or invalid block, or else a failed load of the list. */
  private readonly blockActionError = signal<string | null>(null);
  protected readonly blockError = computed(
    () => this.blockActionError() ?? this.venueService.blocksError(),
  );
  protected readonly today = today();

  ngOnInit(): void {
    this.venueService.loadVenues();
  }

  protected openEdit(v: AdminVenue): void {
    this.editing.set(v);
    this.form.set({
      active: v.active,
      travelMinutes: v.travelMinutes,
      setupMinutes: v.setupMinutes,
      teardownMinutes: v.teardownMinutes,
    });
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
    this.venueService.updateVenue(v.id, this.form()).subscribe({
      next: () => {
        this.busy.set(false);
        this.editing.set(null);
      },
      error: (err) => {
        this.busy.set(false);
        this.formError.set(errorMessage(err));
      },
    });
  }

  protected toggleActive(v: AdminVenue): void {
    if (
      v.active &&
      !confirm(`A(z) ${v.name} pálya inaktív lesz, és nem lehet rá foglalni. Folytatod?`)
    )
      return;
    const { active, travelMinutes, setupMinutes, teardownMinutes } = v;
    this.actionError.set(null);
    this.venueService
      .updateVenue(v.id, { active: !active, travelMinutes, setupMinutes, teardownMinutes })
      .subscribe({ error: (err) => this.actionError.set(errorMessage(err)) });
  }

  protected openBlocks(v: AdminVenue): void {
    this.blocksOf.set(v);
    this.blockActionError.set(null);
    this.blockForm.set({ date: '', from: '08:00', toDate: '', to: '20:00', reason: '' });
    this.venueService.loadBlocks(v.id);
  }

  protected setBlock(key: 'date' | 'from' | 'toDate' | 'to' | 'reason', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.blockForm.update((f) => ({
      ...f,
      [key]: value,
      ...(key === 'date' && !f.toDate ? { toDate: value } : {}),
    }));
  }

  protected addBlock(): void {
    const v = this.blocksOf();
    const f = this.blockForm();
    if (!v) return;
    if (!f.date || !f.toDate || !f.from || !f.to) {
      this.blockActionError.set('Add meg a zárolás kezdetét és végét.');
      return;
    }
    this.blockBusy.set(true);
    this.blockActionError.set(null);
    const block = {
      startsAt: `${f.date}T${f.from}:00`,
      endsAt: `${f.toDate}T${f.to}:00`,
      reason: f.reason.trim() || null,
    };
    this.venueService.addBlock(v.id, block).subscribe({
      next: () => {
        this.blockBusy.set(false);
        this.blockForm.set({ date: '', from: '08:00', toDate: '', to: '20:00', reason: '' });
      },
      error: (err) => {
        this.blockBusy.set(false);
        this.blockActionError.set(errorMessage(err));
      },
    });
  }

  protected deleteBlock(b: VenueBlock): void {
    const v = this.blocksOf();
    if (!v) return;
    this.venueService.deleteBlock(v.id, b.id).subscribe({
      error: (err) => this.blockActionError.set(errorMessage(err)),
    });
  }

  /** "2026-11-10T09:00:00" → "nov. 10. 9:00" */
  protected when(dateTime: string): string {
    return new Intl.DateTimeFormat('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateTime));
  }
}
