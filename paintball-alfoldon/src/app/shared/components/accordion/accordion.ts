import { Component, computed, input, signal } from '@angular/core';

/**
 * Disclosure row (FAQ). Implements the WAI-ARIA accordion pattern:
 * heading > button[aria-expanded][aria-controls] + region[aria-labelledby].
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
})
export class Accordion {
  readonly question = input.required<string>();
  readonly answer = input.required<string>();
  /** Stable, unique suffix for the ARIA ids (parent passes the list index). */
  readonly index = input.required<number>();

  readonly isOpen = signal(false);
  readonly triggerId = computed(() => `faq-trigger-${this.index()}`);
  readonly panelId = computed(() => `faq-panel-${this.index()}`);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}
