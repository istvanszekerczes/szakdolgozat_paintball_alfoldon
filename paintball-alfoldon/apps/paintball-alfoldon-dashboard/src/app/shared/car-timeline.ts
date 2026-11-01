import { Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DaySchedule, SEGMENT_LABELS, SegmentType } from '../core/models';
import { hm, isoDate } from '../core/format';

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
  template: `
    <div class="tl" role="list" aria-label="Autók napi útvonala">
      <div class="row axis" aria-hidden="true">
        <span></span>
        <div class="track">
          @for (h of hours; track h) {
            <span class="tick mono" [style.left.%]="((h - first) / (last - first)) * 100">{{ h }}</span>
          }
        </div>
      </div>
      @for (car of rows(); track car.carId) {
        <div class="row" role="listitem">
          <span class="plate mono">{{ car.plate }}</span>
          <div class="track lane">
            @for (s of car.bars; track $index) {
              @if (s.type === 'GAME') {
                <a class="seg seg-GAME" [routerLink]="['/foglalasok', s.bookingId]" [style.left.%]="s.left" [style.width.%]="s.width" [title]="s.title">{{ s.venueName }}</a>
              } @else {
                <span class="seg" [class]="'seg seg-' + s.type" [style.left.%]="s.left" [style.width.%]="s.width" [title]="s.title"></span>
              }
            }
            @if (!car.bars.length) {
              <span class="free muted">szabad</span>
            }
            @if (nowLeft() !== null) {
              <span class="now" [style.left.%]="nowLeft()"></span>
            }
          </div>
        </div>
      } @empty {
        <p class="muted none">Nincs még autó felvéve (Erőforrások → Autók).</p>
      }
    </div>
    <div class="legend muted">
      @for (t of legend; track t) {
        <span><i [class]="'seg-' + t"></i>{{ labels[t] }}</span>
      }
      @if (nowLeft() !== null) {
        <span><i class="now-key"></i>most</span>
      }
    </div>
  `,
  styles: `
    .tl { display: flex; flex-direction: column; gap: 8px; }
    .row { display: grid; grid-template-columns: 84px 1fr; gap: 10px; align-items: center; }
    .plate { font-size: 12px; }
    .track { position: relative; height: 30px; }
    .axis .track { height: 16px; }
    .lane { background: var(--bg-2); border-radius: 8px; }
    .tick { position: absolute; font-size: 10px; color: var(--fg-2); transform: translateX(-50%); }
    .seg { position: absolute; top: 3px; bottom: 3px; border-radius: 5px; min-width: 2px; }
    .seg-GAME { background: var(--accent); color: var(--on-accent); font-size: 11px; font-weight: 600; padding: 0 6px; line-height: 24px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-decoration: none; }
    .seg-SETUP, .seg-TEARDOWN { background: var(--warn-a); border: 1px solid var(--warn); }
    .seg-TRAVEL_OUT, .seg-TRAVEL_BETWEEN, .seg-TRAVEL_HOME { background: repeating-linear-gradient(135deg, var(--line-2) 0 4px, transparent 4px 8px); border: 1px solid var(--line-2); }
    .free { position: absolute; left: 10px; line-height: 30px; font-size: 12px; }
    .now { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--danger); }
    .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 12px; font-size: 12px; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .legend i { width: 16px; height: 10px; border-radius: 3px; display: inline-block; }
    .now-key { background: var(--danger); width: 2px !important; }
    .none { margin: 0; }
    @media (max-width: 600px) { .row { grid-template-columns: 64px 1fr; } }
  `,
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
