import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { errorMessage } from '../../../../shared/utils/error-message';

/** Beállítások: password change. The theme switch lives in the top right corner of every page. */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  protected readonly auth = inject(AuthService);

  protected readonly current = signal('');
  protected readonly next = signal('');
  protected readonly repeat = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal(false);

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.done.set(false);
    if (this.next().length < 8) {
      this.error.set('Az új jelszó legalább 8 karakter legyen.');
      return;
    }
    if (this.next() !== this.repeat()) {
      this.error.set('A két új jelszó nem egyezik.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.auth.changePassword(this.current(), this.next());
      this.done.set(true);
      this.current.set('');
      this.next.set('');
      this.repeat.set('');
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
