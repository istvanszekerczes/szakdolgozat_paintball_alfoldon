import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { errorMessage } from '../../../../shared/utils/error-message';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
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
