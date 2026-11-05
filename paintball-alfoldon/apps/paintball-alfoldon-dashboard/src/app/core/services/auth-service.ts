import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../shared/utils/error-message';
import { LoginResponse } from '../../features/bookings/models/booking';

const STORAGE_KEY = 'pa-admin-session';

interface Session {
  token: string;
  expiresAt: string;
  username: string;
}

/** Holds the admin JWT. It goes in the Authorization header, never in a cookie (see SecurityConfig). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = inject(API_URL);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly session = signal<Session | null>(this.restore());

  readonly username = computed(() => this.session()?.username ?? null);

  token(): string | null {
    const s = this.session();
    if (!s) return null;
    if (new Date(s.expiresAt).getTime() <= Date.now()) {
      this.clear();
      return null;
    }
    return s.token;
  }

  isLoggedIn(): boolean {
    return this.token() !== null;
  }

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api}/api/admin/auth/login`, { username, password }),
    );
    const session: Session = { token: res.token, expiresAt: res.expiresAt, username };
    this.session.set(session);
    if (this.browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${this.api}/api/admin/auth/password`, { currentPassword, newPassword }),
    );
  }

  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
  }

  private clear(): void {
    this.session.set(null);
    if (this.browser) localStorage.removeItem(STORAGE_KEY);
  }

  private restore(): Session | null {
    if (!this.browser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
