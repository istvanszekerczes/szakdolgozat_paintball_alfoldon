import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DOCUMENT,
  HostListener,
  afterNextRender,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TranslatePipe } from './core/i18n/translate-pipe';
import { TranslationService } from './core/i18n/translation-service';
import { LocationService } from './features/venues/services/location-service';
import { LanguageSwitch } from './shared/components/language-switch/language-switch';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitch],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.has-action-bar]': 'showActionBar()',
  },
})
export class App {
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly locations = inject(LocationService).locations;
  readonly fieldType = LocationService.fieldType;

  /** Full-screen navigation on small screens. */
  readonly menuOpen = signal(false);
  /** "Pályák" dropdown in the desktop navigation. */
  readonly venuesOpen = signal(false);
  private venuesOpenedByHover = false;

  /** Path of the current page, without query string or fragment. */
  private readonly path = signal(this.router.url.split(/[?#]/)[0]);

  /** The fixed booking bar on phones; the booking page has its own buttons. */
  readonly showActionBar = computed(() => !this.path().startsWith('/foglalas'));

  /** On a venue page the bar books that venue, like the page's own button. */
  readonly bookingParams = computed(() => {
    const slug = this.path().slice(1);
    return this.locations().some((loc) => loc.id === slug) ? { palya: slug } : null;
  });

  constructor() {
    // The prerendered page is Hungarian; switch to a saved language only once it has hydrated.
    const translationService = inject(TranslationService);
    afterNextRender(() => translationService.restoreSavedLanguage());

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.path.set(event.urlAfterRedirects.split(/[?#]/)[0]);
        this.closeAll();
      });

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
    // A mouse hovers before it clicks; that click must not close what the hover just opened.
    if (this.venuesOpenedByHover) {
      this.venuesOpenedByHover = false;
      return;
    }
    this.venuesOpen.update((open) => !open);
  }

  openVenues(): void {
    if (!this.venuesOpen()) this.venuesOpenedByHover = true;
    this.venuesOpen.set(true);
  }

  closeVenues(): void {
    this.venuesOpenedByHover = false;
    this.venuesOpen.set(false);
  }

  closeAll(): void {
    this.menuOpen.set(false);
    this.closeVenues();
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
