import { Component, input } from '@angular/core';
import { DaySchedule } from '../../models/schedule';
import { EMPLOYMENT_LABELS } from '../../../employees/models/employee';
import { hm } from '../../../../shared/utils/format';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

/** Who works on the day, from leaving the base until getting back, and with which car. */
@Component({
  selector: 'app-staff-today',
  imports: [StatusBadge],
  templateUrl: './staff-today.html',
  styleUrl: './staff-today.scss',
})
export class StaffToday {
  readonly schedule = input.required<DaySchedule>();
  readonly emptyText = input('Ezen a napon még senki nincs beosztva.');

  protected readonly labels = EMPLOYMENT_LABELS;
  protected readonly hm = hm;
}
