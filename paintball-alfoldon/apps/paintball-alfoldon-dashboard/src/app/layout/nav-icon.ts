import { Component, input } from '@angular/core';

/** Stroke icons of the side menu (Angular strips SVG from [innerHTML], so they are written out here). */
@Component({
  selector: 'app-nav-icon',
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('overview') {
          <svg:rect x="3" y="3" width="7" height="9" rx="1.5" /><svg:rect x="14" y="3" width="7" height="5" rx="1.5" /><svg:rect x="14" y="12" width="7" height="9" rx="1.5" /><svg:rect x="3" y="16" width="7" height="5" rx="1.5" />
        }
        @case ('bookings') {
          <svg:path d="M9 4h6M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" /><svg:path d="M8 11h8M8 15h5" />
        }
        @case ('calendar') {
          <svg:rect x="3" y="5" width="18" height="16" rx="2" /><svg:path d="M3 10h18M8 3v4M16 3v4" />
        }
        @case ('venues') {
          <svg:path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" /><svg:circle cx="12" cy="9.5" r="2.5" />
        }
        @case ('schedule') {
          <svg:circle cx="9" cy="8" r="3.5" /><svg:path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><svg:path d="M16 11l2 2 4-4" />
        }
        @case ('staff') {
          <svg:circle cx="9" cy="8" r="3.5" /><svg:path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><svg:circle cx="17.5" cy="9" r="2.5" /><svg:path d="M17 14.5a5 5 0 0 1 4.5 5" />
        }
        @case ('resources') {
          <svg:path d="M21 8l-9-5-9 5 9 5 9-5z" /><svg:path d="M3 8v8l9 5 9-5V8" /><svg:path d="M12 13v8" />
        }
        @case ('settings') {
          <svg:circle cx="12" cy="12" r="3" /><svg:path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
        }
      }
    </svg>
  `,
  host: { style: 'display: inline-flex' },
})
export class NavIcon {
  readonly name = input.required<string>();
}
