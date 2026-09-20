import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HungaryMapComponent } from '../../components/hungary-map/hungary-map.component';
import { LocationService } from '../../services/location.service';

interface Activity {
  title: string;
  text: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HungaryMapComponent],
  template: `
    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__glow" aria-hidden="true"></div>
      <div class="container hero__inner">
        <span class="eyebrow">Paintball · lézertag · íjászat · csapatjátékok</span>
        <h1 id="hero-title" class="hero__title">Paintball az Alföldön,<br />hét pályán.</h1>
        <p class="lead">
          Szabadtéri erdei terepek és fedett csarnokok Szegedtől Szolnokig. Baráti társaságoknak,
          gyerekzsúrokra és több száz fős céges rendezvényekre.
        </p>
        <div class="hero__actions">
          <a routerLink="/foglalas" class="btn btn--primary btn--lg">Foglalás</a>
          <a routerLink="/kapcsolat" class="btn btn--secondary btn--lg">Árajánlatot kérek</a>
        </div>
        <ul class="hero__facts" aria-label="Röviden">
          <li class="fact"><span class="fact__num">7</span><span class="fact__label">pálya, 6 város</span></li>
          <li class="fact"><span class="fact__num">20+</span><span class="fact__label">év tapasztalat</span></li>
          <li class="fact"><span class="fact__num">2–150+</span><span class="fact__label">fős csoportok</span></li>
          <li class="fact"><span class="fact__num">3</span><span class="fact__label">fedett, télen is játszható</span></li>
        </ul>
      </div>
    </section>

    <!-- Map -->
    <section class="section section--line" aria-labelledby="map-title">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Helyszíneink</span>
          <h2 id="map-title">Válassz pályát a térképen</h2>
          <p>Válassz a listából, hogy a térkép ráközelítsen, majd kattints a jelölőre a részletekért. A fedett pályák télen és rossz időben is játszhatók.</p>
        </div>
        <app-hungary-map />
      </div>
    </section>

    <!-- Venue cards -->
    <section class="section section--alt" aria-labelledby="venues-title">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Pályáink</span>
          <h2 id="venues-title">Erdei terepek és fedett csarnokok</h2>
        </div>
        <div class="venue-grid">
          @for (loc of locations; track loc.id) {
            <a [routerLink]="['/', loc.id]" class="card card--interactive venue-card">
              <div class="venue-card__top">
                <span class="pill" [class.pill--accent]="loc.indoor">{{ fieldType(loc) }}</span>
                <span class="venue-card__capacity mono">{{ loc.optHeadcount }} fő</span>
              </div>
              <h3>{{ loc.city }}</h3>
              <p class="venue-card__venue">{{ loc.venue }}</p>
              <p class="venue-card__desc">{{ loc.terrainType }}</p>
              <span class="link-arrow venue-card__more">
                Részletek
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Why us -->
    <section class="section" aria-labelledby="why-title">
      <div class="container why">
        <div class="why__text">
          <span class="eyebrow">Miért mi?</span>
          <h2 id="why-title">Két évtized tapasztalat, gördülékeny szervezés</h2>
          <p class="lead">
            Tudjuk, hogyan kell megszervezni a tökéletes paintball összecsapást. Akár baráti játékról,
            akár több száz fős céges rendezvényről van szó, ránk számíthatsz.
          </p>
          <ul class="why__points">
            <li><strong>Teljes felszerelés</strong> – marker, páramentes maszk, korlátlan hajtógáz, igény szerint overál.</li>
            <li><strong>Képzett játékvezetők</strong> – biztonságos, jól vezetett játékmenet minden korosztálynak.</li>
            <li><strong>Rugalmas létszám</strong> – kis baráti köröktől óriásrendezvényekig.</li>
          </ul>
        </div>
        <div class="why__stats">
          <div class="card stat"><span class="stat__num">20<em>+</em></span><span class="stat__label">év tapasztalat</span></div>
          <div class="card stat"><span class="stat__num">100k<em>+</em></span><span class="stat__label">elégedett játékos</span></div>
          <div class="card stat"><span class="stat__num">7</span><span class="stat__label">pálya, 6 város</span></div>
          <div class="card stat"><span class="stat__num">2–150<em>+</em></span><span class="stat__label">fős csoportok</span></div>
        </div>
      </div>
    </section>

    <!-- Activities -->
    <section class="section section--alt" aria-labelledby="activities-title">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Szolgáltatások</span>
          <h2 id="activities-title">Kiegészítő tevékenységek</h2>
          <p>A klasszikus paintball mellett az alábbi csapatjátékokat kínáljuk a különböző pályáinkon.</p>
        </div>
        <div class="activity-grid">
          @for (activity of activities; track activity.title; let i = $index) {
            <article class="card activity">
              <span class="activity__index">0{{ i + 1 }}</span>
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.text }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section" aria-labelledby="quotes-title">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Visszajelzések</span>
          <h2 id="quotes-title">Vélemények rólunk</h2>
        </div>
        <div class="quotes">
          @for (t of testimonials; track t.name) {
            <figure class="card quote">
              <blockquote class="quote__text">„{{ t.quote }}”</blockquote>
              <figcaption class="quote__author">
                <span class="quote__name">{{ t.name }}</span>
                <span class="quote__role">{{ t.role }}</span>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="section section--line cta" aria-labelledby="cta-title">
      <div class="container cta__inner">
        <span class="eyebrow">Foglalás</span>
        <h2 id="cta-title">Készen állsz a bevetésre?</h2>
        <p class="lead">Foglald le az időpontodat még ma, vagy kérj egyedi árajánlatot a rendezvényedre.</p>
        <div class="cta__actions">
          <a routerLink="/foglalas" class="btn btn--primary btn--lg">Időpont foglalása</a>
          <a routerLink="/kapcsolat" class="btn btn--secondary btn--lg">Kapcsolatfelvétel</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        position: relative;
        overflow: hidden;
        padding: clamp(5rem, 12vw, 9rem) 0 clamp(4rem, 9vw, 6rem);
      }

      .hero__glow {
        position: absolute;
        top: -30%;
        right: -10%;
        width: min(60vw, 720px);
        aspect-ratio: 1;
        background: radial-gradient(closest-side, var(--accent-a10), transparent 70%);
        filter: blur(40px);
        pointer-events: none;
      }

      .hero__inner {
        position: relative;
        display: grid;
        gap: 1.5rem;
        max-width: 820px;
      }

      .hero__title {
        margin-top: 0.25rem;
      }

      .hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .hero__facts {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem 3rem;
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px solid var(--line);
      }

      .fact {
        display: grid;
        gap: 0.25rem;
      }

      .fact__num {
        font-size: 1.75rem;
        font-weight: 600;
        letter-spacing: -0.03em;
        line-height: 1;
      }

      .fact__label {
        font-size: 0.875rem;
        color: var(--fg-3);
      }

      .venue-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .venue-card {
        gap: 0.5rem;
        min-height: 240px;
        color: var(--fg);
      }

      .venue-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .venue-card__capacity {
        font-size: 0.8125rem;
        color: var(--fg-3);
      }

      .venue-card__venue {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--accent);
      }

      .venue-card__desc {
        flex: 1;
        font-size: 0.9375rem;
      }

      .venue-card__more {
        margin-top: 1rem;
        font-size: 0.9375rem;
      }

      .why {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: clamp(2rem, 6vw, 5rem);
        align-items: center;
      }

      @media (max-width: 900px) {
        .why {
          grid-template-columns: 1fr;
        }
      }

      .why__text {
        display: grid;
        gap: 1.25rem;
      }

      .why__points {
        display: grid;
        gap: 0.75rem;
        color: var(--fg-2);
      }

      .why__points li {
        position: relative;
        padding-left: 1.25rem;
      }

      .why__points li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.6em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
      }

      .why__stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 480px) {
        .why__stats {
          grid-template-columns: 1fr;
        }
      }

      .activity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .activity {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }

      .activity__index {
        font: 500 0.75rem var(--font-mono);
        letter-spacing: 0.1em;
        color: var(--fg-3);
      }

      .activity p {
        font-size: 0.9375rem;
      }

      .quotes {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .quote {
        display: grid;
        gap: 1.5rem;
        align-content: space-between;
      }

      .quote__text {
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--fg);
        text-wrap: pretty;
      }

      .quote__author {
        display: grid;
        gap: 0.15rem;
        font-size: 0.875rem;
      }

      .quote__name {
        font-weight: 600;
        color: var(--fg);
      }

      .quote__role {
        color: var(--fg-3);
      }

      .cta__inner {
        display: grid;
        justify-items: center;
        gap: 1.25rem;
        max-width: 640px;
        text-align: center;
      }

      .cta__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly locations = inject(LocationService).getLocations();
  readonly fieldType = LocationService.fieldType;

  readonly activities: Activity[] = [
    { title: 'Airsoft', text: 'Még valósághűbb katonai szimulációs játék finomabb lövedékekkel és komolyabb harci taktikával.' },
    { title: 'Lézertag', text: 'Fájdalommentes harci játék infravörös fegyverekkel. Ideális családoknak, gyerekzsúrokra és vegyes csapatoknak.' },
    { title: 'Íjász harc (archery tag)', text: 'Biztonságos íjászat szivacsos végű nyilakkal. A dodgeball és az íjászat tökéletes kombinációja.' },
    { title: 'Buborék foci', text: 'Légbuborékba burkolózva focizni – hatalmas ütközések, folyamatos nevetés és garantált jókedv.' },
    { title: 'Vízifoci', text: 'Nyári szezonális kedvenc: felfújható vizes pályán való csúszkálós labdarúgás.' },
    { title: 'Ugráló vár', text: 'A legkisebbeknek fenntartott biztonságos játékterület a családi eseményeken.' },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote:
        'A szegedi Boszorkányszigeten tartottuk a cégünk éves csapatépítőjét. Az erdei terep hangulata fantasztikus volt, a játékvezetők pedig végtelenül profik és rugalmasak. Mindenki imádta!',
      name: 'Kovács Balázs',
      role: 'HR igazgató, Szeged',
    },
    {
      quote:
        'A fiam szülinapi buliját szerveztük ide, lézertagot játszottak a srácok. Szuper volt látni, hogy a gyerekek órákon át rohantak a szabadban ahelyett, hogy a képernyőt nézték volna. Köszönjük!',
      name: 'Nagy Eszter',
      role: 'Szülő, Kecskemét',
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('Paintball Alföldön – Paintball, lézertag és csapatjátékok hét pályán');
    this.meta.updateTag({
      name: 'description',
      content:
        'Paintball, lézertag, airsoft és íjászat hét pályán az Alföldön: Szeged, Szentes, Szolnok, Kecskemét, Békéscsaba és Orosháza. Erdei terepek és fedett csarnokok.',
    });
  }
}
