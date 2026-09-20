import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { GalleryComponent } from '../../components/gallery/gallery.component';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [GalleryComponent],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">Galéria</span>
        <h1 class="page-header__title">Képek a pályákról</h1>
        <p class="page-header__lead lead">
          Ízelítő a hangulatból és a felszerelésekből. A teljes albumokat minden játék után a Facebook-oldalunkon
          tesszük közzé.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container gallery-page">
        <!--
          INTEGRÁCIÓ: a valódi képek betöltéséhez (pl. Facebook Graph API vagy külső galéria)
          a GalleryComponent "items" tömbjét kell feltölteni "src" értékekkel.
        -->
        <app-gallery />

        <aside class="card fb-note">
          <span class="fb-note__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </span>
          <div class="fb-note__text">
            <h2 class="fb-note__title">Friss képek minden játék után</h2>
            <p>
              A játékmesterek által készített teljes albumokat a hivatalos
              <a href="https://facebook.com/PaintballAlfoldon" target="_blank" rel="noopener" class="fb-note__link">Facebook-oldalunkon</a>
              tesszük közzé. Keresd meg magad és a csapatodat az akcióképek között!
            </p>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [
    `
      .gallery-page {
        display: grid;
        gap: clamp(2rem, 5vw, 3.5rem);
      }

      .fb-note {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      @media (max-width: 560px) {
        .fb-note {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .fb-note__icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--accent-a10);
        color: var(--accent);
      }

      .fb-note__icon svg {
        width: 22px;
        height: 22px;
      }

      .fb-note__title {
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
      }

      .fb-note__text p {
        font-size: 0.9375rem;
      }

      .fb-note__link {
        color: var(--fg);
        font-weight: 500;
        text-decoration: underline;
        text-decoration-color: var(--accent);
        text-underline-offset: 3px;
      }

      .fb-note__link:hover {
        color: var(--accent);
      }
    `,
  ],
})
export class GalleryPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Galéria – Képek a pályákról | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content: 'Nézd meg a paintball, lézertag és szabadtéri programjainkon készült képeket. Kedvcsináló és galéria a pályákról.',
    });
  }
}
