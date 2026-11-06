import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../../services/schedule-service';
import { STATUS_LABELS } from '../../../bookings/models/booking';
import { ProposedGame } from '../../models/schedule';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { errorMessage } from '../../../../shared/utils/error-message';
import { hm } from '../../../../shared/utils/format';

/**
 * The proposed drivers of the day: one free employee for each car (the cars are assigned automatically).
 * Nothing changes until the admin applies it; games that already have staff keep it.
 */
@Component({
  selector: 'app-proposal-panel',
  imports: [RouterLink, StatusBadge],
  templateUrl: './proposal-panel.html',
  styleUrl: './proposal-panel.scss',
})
export class ProposalPanel {
  private scheduleService = inject(ScheduleService);

  readonly date = input.required<string>();

  protected readonly hm = hm;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly proposal = this.scheduleService.proposal;
  protected readonly loading = this.scheduleService.proposalLoading;
  protected readonly busy = signal(false);
  private readonly applyError = signal<string | null>(null);
  protected readonly error = computed(
    () => this.applyError() ?? this.scheduleService.proposalError(),
  );
  protected readonly changes = computed(
    () => this.proposal()?.games.filter((g) => g.changed).length ?? 0,
  );
  /** Games the proposal could not find a driver for (not enough free staff that day). */
  protected readonly withoutStaff = computed(
    () => this.proposal()?.games.filter((g) => g.staff.length === 0).length ?? 0,
  );

  constructor() {
    effect(() => {
      const date = this.date();
      untracked(() => {
        this.applyError.set(null);
        this.scheduleService.loadProposal(date);
      });
    });
  }

  protected names(game: ProposedGame): string {
    return game.staff.map((s) => s.name).join(', ');
  }

  protected apply(): void {
    const proposal = this.proposal();
    if (!proposal) return;
    this.busy.set(true);
    this.applyError.set(null);
    this.scheduleService.applyProposal(proposal).subscribe({
      next: () => this.busy.set(false),
      error: (err) => {
        this.busy.set(false);
        this.applyError.set(errorMessage(err));
      },
    });
  }
}
