import { isPlatformBrowser } from '@angular/common';
import { Component, DOCUMENT, HostListener, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LocationService } from './services/location.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly locations = inject(LocationService).getLocations();
  readonly fieldType = LocationService.fieldType;

  /** Full-screen navigation on small screens. */
  readonly menuOpen = signal(false);
  /** "Pályák" dropdown in the desktop navigation. */
  readonly venuesOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeAll());

    // Lock page scrolling while the mobile menu covers the viewport.
    effect(() => {
      if (this.isBrowser) {
        this.document.body.classList.toggle('menu-open', this.menuOpen());
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  toggleVenues(): void {
    this.venuesOpen.update((open) => !open);
  }

  openVenues(): void {
    this.venuesOpen.set(true);
  }

  closeVenues(): void {
    this.venuesOpen.set(false);
  }

  closeAll(): void {
    this.menuOpen.set(false);
    this.venuesOpen.set(false);
  }

  /** Close the dropdown when keyboard focus leaves it entirely. */
  onVenuesFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    const next = event.relatedTarget as Node | null;
    if (!host || !next || !host.contains(next)) {
      this.closeVenues();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser && this.menuOpen() && window.innerWidth > 992) {
      this.menuOpen.set(false);
    }
  }
}
