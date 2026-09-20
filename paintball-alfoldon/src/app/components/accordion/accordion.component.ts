import { Component, computed, input, signal } from '@angular/core';

/**
 * Disclosure row (FAQ). Implements the WAI-ARIA accordion pattern:
 * heading > button[aria-expanded][aria-controls] + region[aria-labelledby].
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  template: `
    <div class="accordion" [class.is-open]="isOpen()">
      <h3 class="accordion__heading">
        <button
          type="button"
          class="accordion__trigger"
          [id]="triggerId()"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="panelId()"
          (click)="toggle()"
        >
          <span class="accordion__question">{{ question() }}</span>
          <svg class="accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </h3>

      <div class="accordion__panel" [id]="panelId()" role="region" [attr.aria-labelledby]="triggerId()" [attr.aria-hidden]="!isOpen()">
        <div class="accordion__content">
          <p>{{ answer() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .accordion {
        border-bottom: 1px solid var(--line);
      }

      .accordion__heading {
        margin: 0;
        font-size: inherit;
        font-weight: inherit;
        letter-spacing: normal;
      }

      .accordion__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        width: 100%;
        min-height: 64px;
        padding: 1.125rem 0;
        text-align: left;
        color: var(--fg);
        font-size: 1.0625rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.4;
        transition: color var(--dur) var(--ease);
      }

      .accordion__trigger:hover {
        color: var(--accent);
      }

      .accordion__trigger:focus-visible {
        outline-offset: 2px;
      }

      .accordion__icon {
        flex: none;
        width: 20px;
        height: 20px;
        color: var(--fg-3);
        transition:
          transform var(--dur) var(--ease),
          color var(--dur) var(--ease);
      }

      .is-open .accordion__icon {
        transform: rotate(45deg);
        color: var(--accent);
      }

      .accordion__panel {
        display: grid;
        grid-template-rows: 0fr;
        overflow: hidden;
        transition: grid-template-rows 220ms var(--ease);
      }

      .is-open .accordion__panel {
        grid-template-rows: 1fr;
      }

      .accordion__content {
        min-height: 0;
      }

      .accordion__content p {
        max-width: 68ch;
        padding: 0 0 1.5rem;
        color: var(--fg-2);
        font-size: 0.9375rem;
        line-height: 1.65;
        text-wrap: pretty;
      }
    `,
  ],
})
export class AccordionComponent {
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
