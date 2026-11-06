import { Service, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStore } from '../store/auth-store';
import { Session } from '../../features/auth/models/auth';

@Service()
export class AuthService {
  private store = inject(AuthStore);
  private router = inject(Router);

  readonly username = computed(() => this.store.username());

  /**
   * Returns the admin token, or null when nobody is logged in or the token has expired.
   *
   * @returns The JWT for the Authorization header, or null.
   */
  token(): string | null {
    const session = this.store.session();
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.store.clearSession();
      return null;
    }
    return session.token;
  }

  /**
   * Tells whether an admin is logged in with a token that has not expired.
   *
   * @returns True when the dashboard pages may be opened.
   */
  isLoggedIn(): boolean {
    return this.token() !== null;
  }

  /**
   * Logs the admin in and remembers the session in the browser.
   *
   * @param username The admin's user name.
   * @param password The admin's password.
   * @returns An Observable of the new session.
   */
  login(username: string, password: string): Observable<Session> {
    return this.store.login(username, password);
  }

  /**
   * Changes the logged-in admin's password.
   *
   * @param currentPassword The password used now.
   * @param newPassword The new password, at least 8 characters.
   * @returns An Observable that completes when the backend accepted the change.
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.store.changePassword(currentPassword, newPassword);
  }

  /**
   * Forgets the session and opens the login page.
   *
   * @returns void
   */
  logout() {
    this.store.clearSession();
    this.router.navigate(['/login']);
  }
}
