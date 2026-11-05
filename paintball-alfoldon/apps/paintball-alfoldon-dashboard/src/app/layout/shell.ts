import { Component, DOCUMENT, OnInit, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { BookingsService } from '../core/bookings.service';
import { NavIcon } from './nav-icon';

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
  template: `
    <div class="layout">
      <nav aria-label="Fő menü" class="nav" [class.open]="menuOpen()">
        <div class="brand">
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="12" fill="none" stroke="var(--accent)" stroke-width="2.5" />
            <circle cx="14" cy="14" r="4.5" fill="var(--accent)" />
          </svg>
          <div class="brand-text">
            <strong>Paintball Alföldön</strong>
            <span class="muted">Admin</span>
          </div>
          <span class="top-theme"><ng-container *ngTemplateOutlet="themeBtn" /></span>
        </div>

        <div class="sheet" id="nav-sheet">
        <div class="links">
          @for (item of nav; track item.path) {
            <a
              class="nav-link"
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              ariaCurrentWhenActive="page"
              (click)="menuOpen.set(false)"
            >
              <app-nav-icon [name]="item.icon" />
              <span class="grow">{{ item.label }}</span>
              @if (item.path === '/foglalasok' && pending()) {
                <span class="count" [attr.aria-label]="pending() + ' függő foglalás'">{{ pending() }}</span>
              }
            </a>
          }
        </div>

        <div class="user">
          <span class="avatar">{{ initials() }}</span>
          <div class="grow user-text">
            <span class="user-name">{{ auth.username() }}</span>
            <span class="muted">Adminisztrátor</span>
          </div>
          <button class="icon-btn" type="button" aria-label="Kijelentkezés" title="Kijelentkezés" (click)="auth.logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </button>
        </div>
        </div>
      </nav>

      <main class="main">
        <div class="toolbar">
          <ng-container *ngTemplateOutlet="themeBtn" />
        </div>
        <router-outlet />
      </main>
    </div>

    <!-- Phones and tablets: the most used pages as a tab bar at the bottom, the rest under "Több" -->
    @if (menuOpen()) {
      <div class="scrim" (click)="menuOpen.set(false)" aria-hidden="true"></div>
    }
    <nav class="tabbar" aria-label="Gyors menü">
      @for (item of tabs; track item.path) {
        <a
          class="tab"
          [routerLink]="item.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: !!item.exact }"
          ariaCurrentWhenActive="page"
          (click)="menuOpen.set(false)"
        >
          <span class="tab-icon">
            <app-nav-icon [name]="item.icon" />
            @if (item.path === '/foglalasok' && pending()) {
              <span class="tab-count" [attr.aria-label]="pending() + ' függő foglalás'">{{ pending() }}</span>
            }
          </span>
          <span class="tab-label">{{ item.short ?? item.label }}</span>
        </a>
      }
      <button
        class="tab"
        type="button"
        [class.active]="menuOpen()"
        [attr.aria-expanded]="menuOpen()"
        aria-controls="nav-sheet"
        (click)="menuOpen.set(!menuOpen())"
      >
        <span class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </span>
        <span class="tab-label">Több</span>
      </button>
    </nav>

    <ng-template #themeBtn>
      <button class="icon-btn" type="button" aria-label="Világos vagy sötét mód" (click)="dark.set(!dark())">
        @if (dark()) {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        } @else {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        }
      </button>
    </ng-template>
  `,
  styles: `
    .layout { min-height: 100vh; display: flex; }
    .nav { flex: 0 0 248px; background: var(--bg-1); border-right: 1px solid var(--line); padding: 20px 14px; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100vh; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 22px; }
    .brand-text { display: flex; flex-direction: column; flex: 1; font-size: 15px; }
    .brand-text span { font-size: 12px; }
    .top-theme, .tabbar, .scrim { display: none; }
    .sheet { display: contents; }
    .links { display: flex; flex-direction: column; gap: 4px; }
    .nav-link { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 14px; border-radius: 10px; color: var(--fg-2); text-decoration: none; font-weight: 500; }
    .nav-link:hover { background: var(--bg-3); color: var(--fg); }
    .nav-link.active { background: var(--accent-a); color: var(--accent); }
    .grow { flex: 1; min-width: 0; }
    .count { font-size: 12px; font-weight: 700; background: var(--accent); color: var(--on-accent); border-radius: 999px; padding: 2px 8px; }
    .user { margin-top: auto; padding: 16px 4px 4px 10px; border-top: 1px solid var(--line); display: flex; align-items: center; gap: 10px; }
    .avatar { width: 36px; height: 36px; border-radius: 999px; background: var(--bg-3); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    .user-text { display: flex; flex-direction: column; font-size: 12px; }
    .user-name { font-size: 14px; font-weight: 600; }
    .main { flex: 1; min-width: 0; padding: 24px clamp(16px, 3vw, 36px) 48px; position: relative; }
    .toolbar { position: absolute; top: 24px; right: clamp(16px, 3vw, 36px); }
    @media (max-width: 900px) {
      .layout { flex-direction: column; }
      /* Top bar: brand and theme switch only; navigation moves to the tab bar at the bottom */
      .nav { position: sticky; top: 0; z-index: 30; height: auto; flex: none; border-right: 0; border-bottom: 1px solid var(--line); padding: 8px 16px; gap: 0; }
      .brand { padding: 0; }
      .top-theme { display: inline-flex; }
      .toolbar { display: none; }
      .main { padding: 18px 16px calc(88px + env(safe-area-inset-bottom)); }

      .tabbar {
        position: fixed; inset: auto 0 0 0; z-index: 50;
        display: grid; grid-template-columns: repeat(5, 1fr);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
        background: var(--bg-1); border-top: 1px solid var(--line);
      }
      .tab {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
        min-height: 52px; padding: 0; border: 0; border-radius: 12px; background: none;
        color: var(--fg-2); font: inherit; font-size: 11px; font-weight: 600; text-decoration: none; cursor: pointer;
      }
      .tab.active { color: var(--accent); }
      .tab-icon { position: relative; display: inline-flex; }
      .tab-count {
        position: absolute; top: -6px; left: 13px; min-width: 18px; padding: 1px 5px; border-radius: 999px;
        background: var(--accent); color: var(--on-accent); font-size: 10px; font-weight: 700; text-align: center; line-height: 16px;
      }

      /* "Több": every page and the user, as a sheet above the tab bar */
      .sheet {
        display: none; position: fixed; inset: auto 0 calc(64px + env(safe-area-inset-bottom)) 0; z-index: 45;
        max-height: calc(100dvh - 140px); overflow-y: auto;
        flex-direction: column; gap: 4px; padding: 12px 12px 8px;
        background: var(--bg-1); border-top: 1px solid var(--line-2); border-radius: 18px 18px 0 0;
        box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.35);
      }
      .nav.open { z-index: 46; }
      .nav.open .sheet { display: flex; }
      .sheet .links, .sheet .user { display: flex; }
      .scrim { display: block; position: fixed; inset: 0; z-index: 40; background: rgba(0, 0, 0, 0.5); }
    }
  `,
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
