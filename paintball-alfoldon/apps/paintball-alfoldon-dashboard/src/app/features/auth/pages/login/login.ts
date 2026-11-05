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
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.busy.set(true);
    this.error.set(null);
    this.authService.login(this.username().trim(), this.password()).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err.status === 401 ? 'Hibás felhasználónév vagy jelszó.' : errorMessage(err));
      },
    });
  }
}
