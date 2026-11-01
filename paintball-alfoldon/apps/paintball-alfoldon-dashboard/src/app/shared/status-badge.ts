import { Component, input } from '@angular/core';

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'muted';

/** Small pill for states: aktív/inaktív, főállású/beugrós, foglalás állapota... */
@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'badge tone-' + tone()">{{ label() }}</span>`,
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<Tone>('muted');
}
