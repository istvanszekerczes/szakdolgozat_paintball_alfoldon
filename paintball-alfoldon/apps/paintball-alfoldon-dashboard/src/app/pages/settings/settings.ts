import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/api';

/** Beállítások: password change. The theme switch lives in the top right corner of every page. */
@Component({
  selector: 'app-settings',
  template: `
    <header class="page-head">
      <div>
        <h1>Beállítások</h1>
        <p class="muted">Bejelentkezve: {{ auth.username() }}</p>
      </div>
    </header>

    <form class="card box" aria-labelledby="jelszo-cim" (submit)="submit($event)">
      <h2 id="jelszo-cim">Jelszócsere</h2>
      <label class="field">
        Jelenlegi jelszó
        <input class="input" type="password" autocomplete="current-password" required [value]="current()" (input)="current.set(value($event))" />
      </label>
      <label class="field">
        Új jelszó (legalább 8 karakter)
        <input class="input" type="password" autocomplete="new-password" minlength="8" required [value]="next()" (input)="next.set(value($event))" />
      </label>
      <label class="field">
        Új jelszó még egyszer
        <input class="input" type="password" autocomplete="new-password" required [value]="repeat()" (input)="repeat.set(value($event))" />
      </label>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      @if (done()) {
        <p class="ok" role="status">A jelszó megváltozott. Legközelebb már az újjal lépj be.</p>
      }
      <button class="btn btn-primary" type="submit" [disabled]="busy() || !current() || !next() || !repeat()">
        {{ busy() ? 'Mentés…' : 'Jelszó módosítása' }}
      </button>
    </form>

    <section class="card box">
      <h2>Megjelenés</h2>
      <p class="muted">Világos vagy sötét mód: a jobb felső sarokban lévő gombbal váltható, a böngésző megjegyzi.</p>
    </section>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 20px; }
    .box { max-width: 480px; display: flex; flex-direction: column; gap: 14px; }
    .box p { margin: 0; line-height: 1.5; }
    .ok { color: var(--ok); }
    .btn { align-self: flex-start; }
  `,
})
export class SettingsPage {
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
