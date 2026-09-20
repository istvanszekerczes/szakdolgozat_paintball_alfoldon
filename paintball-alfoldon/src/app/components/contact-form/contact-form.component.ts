import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type Field = 'name' | 'email' | 'phone' | 'message';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="card form-card">
      @if (submitted()) {
        <div class="form-success" role="status">
          <span class="form-success__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h3>Üzenetedet megkaptuk</h3>
          <p>Köszönjük az érdeklődést. Kollégánk 24 órán belül felveszi veled a kapcsolatot a megadott elérhetőségek egyikén.</p>
          <button type="button" class="btn btn--secondary" (click)="reset()">Új üzenet írása</button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="form" novalidate>
          <div class="field">
            <label for="cf-name" class="field__label">Teljes név</label>
            <input
              id="cf-name"
              type="text"
              class="input"
              formControlName="name"
              autocomplete="name"
              placeholder="Pl. Szabó János"
              [attr.aria-invalid]="invalid('name')"
              [attr.aria-describedby]="invalid('name') ? 'cf-name-error' : null"
            />
            @if (invalid('name')) {
              <p id="cf-name-error" class="field__error">A név megadása kötelező.</p>
            }
          </div>

          <div class="form__row">
            <div class="field">
              <label for="cf-email" class="field__label">E-mail cím</label>
              <input
                id="cf-email"
                type="email"
                class="input"
                formControlName="email"
                autocomplete="email"
                inputmode="email"
                placeholder="Pl. janos@pelda.hu"
                [attr.aria-invalid]="invalid('email')"
                [attr.aria-describedby]="invalid('email') ? 'cf-email-error' : null"
              />
              @if (invalid('email')) {
                <p id="cf-email-error" class="field__error">Kérjük, érvényes e-mail címet adj meg.</p>
              }
            </div>

            <div class="field">
              <label for="cf-phone" class="field__label">Telefonszám</label>
              <input
                id="cf-phone"
                type="tel"
                class="input"
                formControlName="phone"
                autocomplete="tel"
                inputmode="tel"
                placeholder="Pl. +36 30 123 4567"
                [attr.aria-invalid]="invalid('phone')"
                [attr.aria-describedby]="invalid('phone') ? 'cf-phone-error' : null"
              />
              @if (invalid('phone')) {
                <p id="cf-phone-error" class="field__error">A telefonszám megadása kötelező.</p>
              }
            </div>
          </div>

          <div class="field">
            <label for="cf-message" class="field__label">Üzenet vagy ajánlatkérés</label>
            <textarea
              id="cf-message"
              class="input"
              formControlName="message"
              rows="5"
              placeholder="Írd le a tervezett létszámot, dátumot és a választott pályát…"
              [attr.aria-invalid]="invalid('message')"
              [attr.aria-describedby]="invalid('message') ? 'cf-message-error' : 'cf-message-hint'"
            ></textarea>
            @if (invalid('message')) {
              <p id="cf-message-error" class="field__error">Az üzenet legyen legalább 10 karakter hosszú.</p>
            } @else {
              <p id="cf-message-hint" class="form__hint">Minél több részletet írsz, annál pontosabb ajánlatot tudunk adni.</p>
            }
          </div>

          <div class="form__actions">
            <button type="submit" class="btn btn--primary btn--lg">Üzenet küldése</button>
            <p class="form__hint">24 órán belül válaszolunk.</p>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .form {
        display: grid;
        gap: 1.25rem;
      }

      .form__row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }

      @media (max-width: 640px) {
        .form__row {
          grid-template-columns: 1fr;
        }
      }

      .form__hint {
        font-size: 0.8125rem;
        color: var(--fg-3);
      }

      .form__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
      }

      @media (max-width: 480px) {
        .form__actions .btn {
          width: 100%;
        }
      }

      .form-success {
        display: grid;
        justify-items: center;
        gap: 0.75rem;
        padding: 1.5rem 0;
        text-align: center;
      }

      .form-success p {
        max-width: 42ch;
      }

      .form-success .btn {
        margin-top: 0.75rem;
      }

      .form-success__icon {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        margin-bottom: 0.5rem;
        border-radius: 50%;
        background: var(--accent);
        color: var(--on-accent);
      }

      .form-success__icon svg {
        width: 26px;
        height: 26px;
      }
    `,
  ],
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly submitted = signal(false);

  invalid(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: send `this.form.getRawValue()` to the booking/CRM backend once it exists.
    this.submitted.set(true);
    this.form.reset();
  }

  reset(): void {
    this.submitted.set(false);
  }
}
