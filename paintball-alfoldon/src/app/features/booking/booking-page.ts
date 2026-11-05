import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BookingWizard } from './wizard/booking-wizard';

@Component({
  selector: 'app-booking-page',
  imports: [BookingWizard],
  template: `
    <section class="page-header page-header--center">
      <div class="container">
        <span class="eyebrow">Foglalás</span>
        <h1 class="page-header__title">Időpont foglalása</h1>
        <p class="page-header__lead lead">
          Válassz pályát, időpontot és létszámot, és pár perc alatt elküldheted a foglalásod. Inkább
          beszélnél velünk? Telefonon és e-mailben is foglalhatsz.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container booking">
        <div class="notice" role="note">
          <svg
            class="notice__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p>
            <strong>Fontos:</strong> előzetes időpontfoglalás szükséges, lehetőleg legalább
            <strong>egy héttel a tervezett játék előtt</strong>, hogy a pályát és a felszerelést
            garantálni tudjuk.
          </p>
        </div>

        <!-- The wizard talks to the API, so it only runs in the browser; the prerendered page shows the placeholder. -->
        @defer (on idle) {
          <app-booking-wizard />
        } @placeholder {
          <div class="card booking__placeholder" aria-busy="true">Foglalási űrlap betöltése…</div>
        }

        <h2 class="booking__alt">Inkább telefonon vagy e-mailben?</h2>

        <div class="channels">
          <article class="card channel">
            <span class="eyebrow">Telefon</span>
            <h2 class="channel__value">+36 30/977 14 86</h2>
            <p>Hétfőtől vasárnapig 06:00–22:00, ünnepnapokon is.</p>
            <a href="tel:+36309771486" class="btn btn--primary btn--lg btn--block">Hívás most</a>
          </article>

          <article class="card channel">
            <span class="eyebrow">E-mail</span>
            <h2 class="channel__value">paintball&#64;alfoldon.hu</h2>
            <p>Ajánlatkérésre és levelekre 24 órán belül válaszolunk.</p>
            <a href="mailto:paintball@alfoldon.hu" class="btn btn--secondary btn--lg btn--block"
              >E-mail küldése</a
            >
          </article>
        </div>

        <p class="booking__hint">
          Telefonon vagy e-mailben írd meg a tervezett dátumot, a létszámot és a választott pályát,
          így azonnal pontos ajánlatot tudunk adni.
        </p>
      </div>
    </section>
  `,
  styles: [
    `
      .booking {
        display: grid;
        gap: 1.5rem;
        max-width: 880px;
      }

      .notice {
        display: flex;
        gap: 0.875rem;
        align-items: flex-start;
        padding: 1rem 1.25rem;
        border: 1px solid rgba(255, 196, 102, 0.35);
        border-radius: var(--radius);
        background: rgba(255, 196, 102, 0.06);
      }

      .notice p {
        font-size: 0.9375rem;
        color: var(--fg-2);
      }

      /* Phones: the form starts on the first screen. The lead repeats the phone/e-mail option
         that has its own section under the form. */
      @media (max-width: 640px) {
        .page-header__lead {
          display: none;
        }

        .booking {
          gap: 1rem;
        }

        .notice {
          padding: 0.75rem 1rem;
        }

        .notice p {
          font-size: 0.875rem;
        }

        .channel p {
          min-height: 0;
        }
      }

      .notice strong {
        color: var(--warn);
      }

      .notice__icon {
        flex: none;
        width: 22px;
        height: 22px;
        margin-top: 0.1rem;
        color: var(--warn);
      }

      .channels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 700px) {
        .channels {
          grid-template-columns: 1fr;
        }
      }

      .channel {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }

      .channel__value {
        font-size: clamp(1.375rem, 1.1rem + 1.2vw, 1.875rem);
        letter-spacing: -0.02em;
        overflow-wrap: anywhere;
      }

      .channel p {
        font-size: 0.9375rem;
        min-height: 3em;
      }

      .channel .btn {
        margin-top: 0.5rem;
      }

      .booking__placeholder {
        min-height: 320px;
        color: var(--fg-3);
      }

      .booking__alt {
        margin-top: 1.5rem;
        font-size: 1.25rem;
      }

      .booking__hint {
        font-size: 0.9375rem;
        text-align: center;
        color: var(--fg-3);
      }
    `,
  ],
})
export class BookingPage implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Időpont foglalás – Paintball és lézertag | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Foglald le paintball vagy lézertag időpontodat. Válassz pályát és időpontot, és foglalj online pár perc alatt, vagy keress minket telefonon vagy e-mailben.',
    });
  }
}
