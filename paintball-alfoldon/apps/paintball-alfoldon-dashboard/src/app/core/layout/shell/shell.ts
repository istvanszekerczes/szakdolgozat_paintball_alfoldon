import { Component, DOCUMENT, OnInit, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { BookingsService } from '../../../features/bookings/services/booking-service';
import { NavIcon } from '../nav-icon/nav-icon';

const THEME_KEY = 'pa-admin-theme';

interface NavItem {
  path: string;
  label: string;
  /** Label in the phone tab bar, where the full one does not fit. */
  short?: string;
  icon: string;
  exact?: boolean;
}

/** Side menu + page area of the signed-in admin. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavIcon, NgTemplateOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly bookings = inject(BookingsService);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly menuOpen = signal(false);
  protected readonly dark = signal(this.readTheme());
  protected readonly pending = this.bookings.pendingCount;
  protected readonly initials = computed(() => (this.auth.username() ?? '?').slice(0, 2));

  protected readonly nav: NavItem[] = [
    { path: '/', label: 'Áttekintés', exact: true, icon: 'overview' },
    { path: '/foglalasok', label: 'Foglalások', icon: 'bookings' },
    { path: '/naptar', label: 'Naptár', icon: 'calendar' },
    { path: '/palyak', label: 'Pályák', icon: 'venues' },
    { path: '/beosztas', label: 'Beosztás és kiírások', icon: 'schedule' },
    { path: '/alkalmazottak', label: 'Alkalmazottak', icon: 'staff' },
    { path: '/eroforrasok', label: 'Erőforrások', icon: 'resources' },
    { path: '/beallitasok', label: 'Beállítások', icon: 'settings' },
  ];

  /** Pages in the phone tab bar; the rest are under "Több". */
  protected readonly tabs: NavItem[] = [
    { path: '/', label: 'Áttekintés', exact: true, icon: 'overview' },
    { path: '/foglalasok', label: 'Foglalások', icon: 'bookings' },
    { path: '/naptar', label: 'Naptár', icon: 'calendar' },
    { path: '/beosztas', label: 'Beosztás és kiírások', short: 'Beosztás', icon: 'schedule' },
  ];

  constructor() {
    effect(() => {
      const dark = this.dark();
      const root = this.document.documentElement;
      root.classList.toggle('theme-light', !dark);
      root.classList.toggle('theme-dark', dark);
      if (this.browser) {
        try {
          localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
        } catch {
          /* storage unavailable: theme just isn't remembered */
        }
      }
    });
  }

  ngOnInit(): void {
    this.bookings.refreshPendingCount();
  }

  private readTheme(): boolean {
    if (!this.browser) return true;
    try {
      return localStorage.getItem(THEME_KEY) !== 'light';
    } catch {
      return true;
    }
  }
}
