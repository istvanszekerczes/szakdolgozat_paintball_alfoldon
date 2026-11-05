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
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
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
