import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ContactFormComponent],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">Kapcsolat</span>
        <h1 class="page-header__title">Beszéljünk a játékról</h1>
        <p class="page-header__lead lead">
          Céges csapatépítőt, születésnapot vagy legénybúcsút szervezel? Kérdésed van a felszerelésről? Írj vagy hívj
          minket – 24 órán belül válaszolunk.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container contact">
        <div class="contact__info">
          <div class="card channel">
            <span class="eyebrow">Telefon</span>
            <a href="tel:+36309771486" class="channel__value">+36 30/977 14 86</a>
            <p>Hétfőtől vasárnapig 06:00–22:00, ünnepnapokon is hívható.</p>
          </div>

          <div class="card channel">
            <span class="eyebrow">E-mail</span>
            <a href="mailto:paintball@alfoldon.hu" class="channel__value">paintball&#64;alfoldon.hu</a>
            <p>Ajánlatkérésre és levelekre 24 órán belül írásban válaszolunk.</p>
          </div>

          <div class="card channel">
            <span class="eyebrow">Facebook</span>
            <a href="https://facebook.com/PaintballAlfoldon" target="_blank" rel="noopener" class="channel__value">Paintball Alföldön</a>
            <p>Képek, friss hírek és rendezvényinformációk a Facebook-oldalunkon.</p>
          </div>
        </div>

        <div class="contact__form">
          <h2 class="contact__form-title">Üzenetküldés</h2>
          <app-contact-form />
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .contact {
        display: grid;
        grid-template-columns: minmax(280px, 1fr) minmax(0, 1.4fr);
        gap: clamp(2rem, 5vw, 4rem);
        align-items: start;
      }

      @media (max-width: 900px) {
        .contact {
          grid-template-columns: 1fr;
        }
      }

      .contact__info {
        display: grid;
        gap: 1rem;
      }

      .channel {
        display: grid;
        gap: 0.5rem;
      }

      .channel__value {
        font-size: clamp(1.25rem, 1.05rem + 0.8vw, 1.5rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--fg);
        overflow-wrap: anywhere;
        transition: color var(--dur) var(--ease);
      }

      .channel__value:hover {
        color: var(--accent);
      }

      .channel p {
        font-size: 0.9375rem;
      }

      .contact__form {
        display: grid;
        gap: 1.25rem;
      }

      .contact__form-title {
        font-size: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
      }
    `,
  ],
})
export class ContactComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Kapcsolat és ajánlatkérés | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content: 'Lépj kapcsolatba velünk: telefonszám, e-mail, nyitvatartás és közvetlen online üzenetküldés a Paintball Alföldön csapatának.',
    });
  }
}
