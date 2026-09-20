import { Component, ElementRef, HostListener, effect, signal, viewChild } from '@angular/core';

export interface GalleryItem {
  /** Reserved for real photos once an image source (e.g. Facebook albums) is wired in. */
  src?: string;
  caption: string;
}

/**
 * Image grid with a lightbox. Photos are not yet available, so tiles render a
 * minimal placeholder; swap `src` in when real media arrives.
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  template: `
    <ul class="gallery" aria-label="Galéria">
      @for (item of items; track item.caption; let i = $index) {
        <li>
          <button type="button" class="tile" (click)="open(i)" [attr.aria-label]="'Megnyitás: ' + item.caption">
            <span class="tile__media" aria-hidden="true">
              <span class="tile__index mono">{{ pad(i + 1) }}</span>
            </span>
            <span class="tile__caption">{{ item.caption }}</span>
          </button>
        </li>
      }
    </ul>

    @if (active(); as idx) {
      <div class="lightbox" (click)="onBackdrop($event)" (keydown)="onKeydown($event)">
        <div class="lightbox__dialog" role="dialog" aria-modal="true" [attr.aria-label]="items[idx.value].caption">
          <button #closeBtn type="button" class="lightbox__btn lightbox__close" (click)="close()" aria-label="Bezárás">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <figure class="lightbox__figure">
            <div class="lightbox__media" aria-hidden="true">
              <span class="lightbox__index mono">{{ pad(idx.value + 1) }} / {{ pad(items.length) }}</span>
            </div>
            <figcaption class="lightbox__caption">{{ items[idx.value].caption }}</figcaption>
          </figure>

          <div class="lightbox__nav">
            <button type="button" class="lightbox__btn" (click)="prev()" aria-label="Előző kép">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" class="lightbox__btn" (click)="next()" aria-label="Következő kép">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .tile {
        display: grid;
        gap: 0.75rem;
        width: 100%;
        text-align: left;
        color: var(--fg);
        border-radius: var(--radius-lg);
      }

      .tile:focus-visible {
        outline-offset: 4px;
      }

      .tile__media {
        position: relative;
        display: grid;
        place-items: end start;
        aspect-ratio: 4 / 3;
        padding: 1rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background:
          radial-gradient(120% 90% at 100% 0%, var(--accent-a10), transparent 55%),
          linear-gradient(160deg, var(--bg-3), var(--bg-1));
        transition:
          border-color var(--dur) var(--ease),
          transform var(--dur) var(--ease);
      }

      .tile:hover .tile__media,
      .tile:focus-visible .tile__media {
        border-color: var(--line-3);
        transform: translateY(-2px);
      }

      .tile__index {
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        color: var(--fg-3);
      }

      .tile__caption {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--fg-2);
        line-height: 1.4;
      }

      .tile:hover .tile__caption {
        color: var(--fg);
      }

      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.9);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
      }

      .lightbox__dialog {
        position: relative;
        width: min(100%, 960px);
        display: grid;
        gap: 1.25rem;
      }

      .lightbox__figure {
        display: grid;
        gap: 1rem;
        margin: 0;
      }

      .lightbox__media {
        display: grid;
        place-items: center;
        aspect-ratio: 16 / 10;
        max-height: 70vh;
        border: 1px solid var(--line-2);
        border-radius: var(--radius-lg);
        background:
          radial-gradient(120% 90% at 100% 0%, var(--accent-a10), transparent 55%),
          linear-gradient(160deg, var(--bg-3), var(--bg-1));
      }

      .lightbox__index {
        font-size: 0.875rem;
        letter-spacing: 0.1em;
        color: var(--fg-3);
      }

      .lightbox__caption {
        text-align: center;
        font-size: 1.0625rem;
        font-weight: 500;
        color: var(--fg);
      }

      .lightbox__btn {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid var(--line-2);
        background: rgba(12, 12, 12, 0.9);
        color: var(--fg);
        transition:
          background-color var(--dur) var(--ease),
          border-color var(--dur) var(--ease);
      }

      .lightbox__btn:hover {
        background: var(--bg-3);
        border-color: var(--line-3);
      }

      .lightbox__btn svg {
        width: 20px;
        height: 20px;
      }

      .lightbox__close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        z-index: 1;
      }

      .lightbox__nav {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
      }
    `,
  ],
})
export class GalleryComponent {
  readonly items: GalleryItem[] = [
    { caption: 'Szeged – Boszorkánysziget, erdei pálya' },
    { caption: 'Szeged – Katonai csarnok, fedett CQB pálya' },
    { caption: 'Szentes – rekreációs zóna, szabadtéri pálya' },
    { caption: 'Szolnok – Tiszaliget, fedett épületek' },
    { caption: 'Kecskemét – Homokbánya, többszintes indoor pálya' },
    { caption: 'Békéscsaba – Póstelek, erdei terep lövészárkokkal' },
    { caption: 'Orosháza – volt katonai gyakorlótér' },
  ];

  /** Wrapped in an object so `@if (active(); as idx)` also works for index 0. */
  readonly active = signal<{ value: number } | null>(null);

  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    // Move focus into the dialog as soon as it renders.
    effect(() => {
      this.closeBtn()?.nativeElement.focus();
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  open(index: number): void {
    this.returnFocusTo = document.activeElement as HTMLElement | null;
    this.active.set({ value: index });
  }

  close(): void {
    this.active.set(null);
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }

  prev(): void {
    this.step(-1);
  }

  next(): void {
    this.step(1);
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox')) {
      this.close();
    }
  }

  /** Keep Tab focus inside the dialog while it is open. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const dialog = (event.currentTarget as HTMLElement).querySelector('.lightbox__dialog');
    const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (this.active() === null) return;
    if (event.key === 'Escape') this.close();
    else if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'ArrowRight') this.next();
  }

  private step(delta: number): void {
    const current = this.active();
    if (!current) return;
    const count = this.items.length;
    this.active.set({ value: (current.value + delta + count) % count });
  }
}
