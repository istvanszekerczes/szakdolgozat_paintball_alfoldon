import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { BookingsService } from '../../services/booking-service';
import { AdminBooking, BookingStatus, NEXT_STATUSES, STATUS_LABELS } from '../../models/booking';
import { errorMessage } from '../../../../shared/utils/error-message';
import { hm, longDay, relative } from '../../../../shared/utils/format';
import { AssignmentPanel } from '../../../schedule/components/assignment-panel/assignment-panel';

const ACTION_LABELS: Record<BookingStatus, string> = {
  PENDING: '',
  ACCEPTED: 'Elfogadás',
  REJECTED: 'Elutasítás',
  CANCELLED: 'Lemondás',
};

/** One booking in a side panel: details, status change and assignment. Used by Foglalások and Naptár. */
@Component({
  selector: 'app-booking-detail',
  imports: [AssignmentPanel],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
  host: { class: 'card', 'aria-label': 'Foglalás részletei', role: 'complementary' },
})
export class BookingDetail {
  private readonly bookings = inject(BookingsService);

  readonly bookingId = input.required<number>();
  /** A copy the page already has, shown until the fresh one arrives. */
  readonly initial = input<AdminBooking | null>(null);
  readonly changed = output<AdminBooking>();
  readonly closed = output<void>();

  protected readonly labels = STATUS_LABELS;
  protected readonly actionLabels = ACTION_LABELS;
  protected readonly hm = hm;
  protected readonly longDay = longDay;
  protected readonly relative = relative;

  protected readonly booking = signal<AdminBooking | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);

  protected readonly nextStatuses = computed(() => {
    const b = this.booking();
    return b ? NEXT_STATUSES[b.status] : [];
  });

  protected readonly assignable = computed(() => {
    const status = this.booking()?.status;
    return status === 'PENDING' || status === 'ACCEPTED';
  });

  constructor() {
    effect(() => {
      const id = this.bookingId();
      untracked(() => this.load(id));
    });
  }

  protected changeStatus(status: BookingStatus): void {
    const b = this.booking();
    if (!b) return;
    if (status === 'CANCELLED' && !confirm(`Biztosan lemondod ${b.customer.name} foglalását?`)) return;
    this.busy.set(true);
    this.error.set(null);
    this.bookings.changeStatus(b.id, status).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.update(updated);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  protected update(updated: AdminBooking): void {
    this.booking.set(updated);
    this.changed.emit(updated);
  }

  private load(id: number): void {
    this.error.set(null);
    const initial = this.initial();
    this.booking.set(initial?.id === id ? initial : null);
    this.bookings.get(id).subscribe({
      next: (b) => this.booking.set(b),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
