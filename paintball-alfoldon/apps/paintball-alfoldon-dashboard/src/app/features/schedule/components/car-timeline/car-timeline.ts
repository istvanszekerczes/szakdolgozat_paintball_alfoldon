import { Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DaySchedule, SEGMENT_LABELS, SegmentType } from '../../models/schedule';
import { hm, isoDate } from '../../../../shared/utils/format';

const FIRST_HOUR = 7;
const LAST_HOUR = 20;
const SPAN = (LAST_HOUR - FIRST_HOUR) * 60;

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Percentage position of a time on the 7:00–20:00 axis, clamped to the axis. */
function pos(time: string): number {
  return Math.min(100, Math.max(0, ((minutes(time) - FIRST_HOUR * 60) / SPAN) * 100));
}

/**
 * One row per car between 7:00 and 20:00: odaút, kipakolás, játék, elpakolás, köztes út, hazaút
 * as computed by the backend (/api/admin/schedule). Shows a "most" line when the day is today.
 */
@Component({
  selector: 'app-car-timeline',
  imports: [RouterLink],
  templateUrl: './car-timeline.html',
  styleUrl: './car-timeline.scss',
})
export class CarTimeline {
  readonly schedule = input.required<DaySchedule>();

  protected readonly first = FIRST_HOUR;
  protected readonly last = LAST_HOUR;
  protected readonly hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i).filter(
    (h) => h % 2 === 1,
  );
  protected readonly labels = SEGMENT_LABELS;
  protected readonly legend: SegmentType[] = ['TRAVEL_OUT', 'SETUP', 'GAME', 'TEARDOWN'];

  private readonly now = signal(new Date());

  protected readonly rows = computed(() =>
    this.schedule().cars.map((car) => ({
      ...car,
      bars: car.segments.map((s) => ({
        ...s,
        left: pos(s.start),
        width: pos(s.end) - pos(s.start),
        title: `${SEGMENT_LABELS[s.type]} ${hm(s.start)}–${hm(s.end)} · ${s.venueName}`,
      })),
    })),
  );

  protected readonly nowLeft = computed(() => {
    const d = this.now();
    if (isoDate(d) !== this.schedule().date) return null;
    const m = d.getHours() * 60 + d.getMinutes() - FIRST_HOUR * 60;
    return m < 0 || m > SPAN ? null : (m / SPAN) * 100;
  });

  constructor() {
    effect((onCleanup) => {
      const timer = setInterval(() => this.now.set(new Date()), 60_000);
      onCleanup(() => clearInterval(timer));
    });
  }
}
