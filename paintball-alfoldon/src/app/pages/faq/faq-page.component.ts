import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AccordionComponent } from '../../components/accordion/accordion.component';

interface Faq {
  q: string;
  a: string;
}

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [AccordionComponent, RouterLink],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">GYIK</span>
        <h1 class="page-header__title">Gyakori kérdések</h1>
        <p class="page-header__lead lead">
          Mindent összeszedtünk, amit a játék előtt tudnod kell. Ha további kérdésed van, keress minket bizalommal.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container faq">
        <div class="faq__list">
          @for (faq of faqs; track faq.q; let i = $index) {
            <app-accordion [question]="faq.q" [answer]="faq.a" [index]="i" />
          }
        </div>

        <aside class="card faq__help">
          <span class="eyebrow">Segítség</span>
          <h2 class="faq__help-title">További kérdésed van?</h2>
          <p>
            Ha nem találtál választ a kérdésedre, vagy egyedi igényekkel érkeznél, szívesen segítünk telefonon vagy
            e-mailben is.
          </p>
          <div class="faq__help-actions">
            <a routerLink="/kapcsolat" class="btn btn--primary">Kapcsolatfelvétel</a>
            <a href="tel:+36309771486" class="btn btn--secondary">+36 30/977 14 86</a>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [
    `
      .faq {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
        gap: clamp(2rem, 5vw, 4rem);
        align-items: start;
      }

      @media (max-width: 900px) {
        .faq {
          grid-template-columns: 1fr;
        }
      }

      .faq__list {
        border-top: 1px solid var(--line);
      }

      .faq__help {
        display: grid;
        gap: 1rem;
        position: sticky;
        top: calc(var(--header-h) + 1.5rem);
      }

      @media (max-width: 900px) {
        .faq__help {
          position: static;
        }
      }

      .faq__help-title {
        font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
      }

      .faq__help p {
        font-size: 0.9375rem;
      }

      .faq__help-actions {
        display: grid;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class FaqPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly faqs: Faq[] = [
    {
      q: 'Hány játékos játszhat egyszerre?',
      a: 'A minimális ajánlott létszám ~10 fő, de ennél kisebb csoportok is jöhetnek játszani. Technikai felső határ nincs, ugyanakkor 80 fő feletti egyidejű játék esetén kérjük az előzetes egyeztetést, hogy a pályabeosztást és a játékmesterek számát megfelelően igazíthassuk.',
    },
    {
      q: 'Mi tartozik a paintball alapfelszereléshez?',
      a: 'Az alapcsomag tartalmazza a paintball fegyvert (markert) és annak minden szükséges tartozékát, a korlátlan sűrített hajtógáztöltést a játék során, valamint egy páramentesítő lencsével felszerelt professzionális védőmaszkot.',
    },
    {
      q: 'Kijön-e a festék a ruhából?',
      a: 'Igen! A golyókban lévő festék természetes ételszínezék alapú, biológiailag lebomló és vízben kiválóan oldódik, így egy egyszerű otthoni mosással teljesen eltávolítható a ruházatból. Igény esetén terepszínű védőoverált is biztosítunk a helyszínen.',
    },
    {
      q: 'Káros-e a paintball golyó a környezetre?',
      a: 'Egyáltalán nem. A lövedékek 100%-ban biológiailag lebomló anyagokból állnak. A külső héj zselatinburok, a benne lévő színezék pedig nem mérgező, ételfestéket tartalmazó anyag, ami a természetben az eső és a napsütés hatására rövid idő alatt nyomtalanul feloldódik.',
    },
    {
      q: 'Lehet-e fényképezni a játék közben?',
      a: 'Igen, de biztonsági okokból kizárólag megfelelő védőfelszereléssel (maszkban) rendelkező fotós tartózkodhat a pálya területén a játék alatt. Jó hír, hogy játékmestereink is rendszeresen készítenek minőségi akciófotókat a csatákról, amelyeket utólag ingyenesen feltöltünk a Facebook galériánkba.',
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('Gyakori kérdések a játékról | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Mindent a paintballról: csoportméretek, alapfelszerelés, környezetvédelmi szempontok, ruházat tisztítása és fotózási szabályok pályáinkon.',
    });
  }
}
