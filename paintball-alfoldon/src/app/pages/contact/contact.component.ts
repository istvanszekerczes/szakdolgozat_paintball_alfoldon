import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">Kapcsolat</span>
        <h1 class="page-header__title">Beszéljünk a játékról</h1>
        <p class="page-header__lead lead">
          Céges csapatépítőt, születésnapot vagy legénybúcsút szervezel? Kérdésed van a
          felszerelésről? Hívj vagy írj nekünk – e-mailre 24 órán belül válaszolunk.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container channels">
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
    </section>
  `,
  styles: [
    `
      .channels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        max-width: 880px;
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
      content:
        'Lépj kapcsolatba velünk: telefonszám, e-mail és elérhetőségi idő. Hívj minket 06:00 és 22:00 között, vagy írj e-mailt, és 24 órán belül válaszolunk.',
    });
  }
}
