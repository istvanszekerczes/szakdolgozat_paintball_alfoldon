import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/api';

@Component({
  selector: 'app-login',
  template: `
    <div class="wrap">
      <form class="card box" (submit)="submit($event)">
        <div class="brand">
          <svg width="36" height="36" viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="12" fill="none" stroke="var(--accent)" stroke-width="2.5" />
            <circle cx="14" cy="14" r="4.5" fill="var(--accent)" />
          </svg>
          <div>
            <h1>Paintball Alföldön</h1>
            <p class="muted">Admin felület</p>
          </div>
        </div>

        <label class="field">
          Felhasználónév
          <input class="input" name="username" autocomplete="username" required [value]="username()" (input)="username.set(value($event))" />
        </label>
        <label class="field">
          Jelszó
          <input class="input" name="password" type="password" autocomplete="current-password" required [value]="password()" (input)="password.set(value($event))" />
        </label>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button class="btn btn-primary submit" type="submit" [disabled]="busy() || !username() || !password()">
          {{ busy() ? 'Bejelentkezés…' : 'Bejelentkezés' }}
        </button>
      </form>
    </div>
  `,
  styles: `
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .box { width: 100%; max-width: 380px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
    .brand h1 { font-size: 20px; }
    .brand p { margin: 2px 0 0; font-size: 13px; }
    .error { margin: 0; }
    .submit { min-height: 44px; font-size: 14px; }
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.username().trim(), this.password());
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(
        (err as { status?: number }).status === 401 ? 'Hibás felhasználónév vagy jelszó.' : errorMessage(err),
      );
    } finally {
      this.busy.set(false);
    }
  }
}
