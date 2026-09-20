import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VenueMapComponent } from '../../components/venue-map/venue-map.component';
import { directionsUrl } from '../../map/map-core';
import { LocationService, PaintballLocation } from '../../services/location.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [RouterLink, VenueMapComponent],
  template: `
    @if (location(); as loc) {
      <section class="page-header">
        <div class="container">
          <span class="eyebrow">{{ loc.venue }}</span>
          <h1 class="page-header__title">{{ loc.city }}</h1>
          <p class="page-header__lead lead">{{ loc.terrainType }}. {{ loc.address }}.</p>
          <ul class="loc-meta" aria-label="Fő adatok">
            <li class="pill" [class.pill--accent]="loc.indoor">{{ fieldType(loc) }}</li>
            <li class="pill">Ajánlott {{ loc.optHeadcount }} fő</li>
            <li class="pill">Max. {{ loc.maxHeadcount }} fő</li>
          </ul>
        </div>
      </section>

      <section class="section">
        <div class="container loc">
          <div class="loc__main">
            <div class="prose">
              <h2>A pályáról</h2>
              <p class="lead">{{ loc.detailedDescription }}</p>
            </div>

            <div class="prose">
              <h3>Kiegészítő programok</h3>
              <p>A klasszikus paintball mellett ezen a pályán előzetes egyeztetés szerint elérhető:</p>
              <ul class="tags" aria-label="Kiegészítő programok">
                @for (activity of loc.extraActivities; track activity) {
                  <li class="pill">{{ activity }}</li>
                }
              </ul>
            </div>

            <div class="loc-map">
              <div class="loc-map__head">
                <h3>Térkép</h3>
                <a [href]="directions(loc)" target="_blank" rel="noopener" class="link-arrow">
                  Útvonalterv
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </a>
              </div>
              <app-venue-map [location]="loc" />
            </div>
          </div>

          <aside class="loc__side">
            <div class="card specs-card">
              <h2 class="specs-card__title">Adatok</h2>
              <dl class="specs">
                <div class="specs__row">
                  <dt>Cím</dt>
                  <dd>{{ loc.address }}</dd>
                </div>
                <div class="specs__row">
                  <dt>Terep</dt>
                  <dd>{{ loc.terrainType }}</dd>
                </div>
                <div class="specs__row">
                  <dt>Minimális létszám</dt>
                  <dd>{{ loc.minHeadcount }} fő</dd>
                </div>
                <div class="specs__row">
                  <dt>Ajánlott létszám</dt>
                  <dd class="is-accent">{{ loc.optHeadcount }} fő</dd>
                </div>
                <div class="specs__row">
                  <dt>Maximális létszám</dt>
                  <dd>{{ loc.maxHeadcount }} fő</dd>
                </div>
                <div class="specs__row">
                  <dt>Koordináták</dt>
                  <dd class="mono">{{ coords(loc) }}</dd>
                </div>
              </dl>

              <div class="specs-card__cta">
                <p>Szeretnéd lefoglalni ezt a pályát a csapatodnak?</p>
                <a routerLink="/foglalas" class="btn btn--primary btn--block">Időpont foglalása</a>
                <a routerLink="/kapcsolat" class="btn btn--secondary btn--block">Árajánlatot kérek</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    }
  `,
  styles: [
    `
      .loc-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }

      .loc {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
        gap: clamp(2rem, 5vw, 4rem);
        align-items: start;
      }

      @media (max-width: 900px) {
        .loc {
          grid-template-columns: 1fr;
        }
      }

      .loc__main {
        display: grid;
        gap: 2.5rem;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }

      .loc-map {
        display: grid;
        gap: 1rem;
      }

      .loc-map__head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .loc__side {
        position: sticky;
        top: calc(var(--header-h) + 1.5rem);
      }

      @media (max-width: 900px) {
        .loc__side {
          position: static;
        }
      }

      .specs-card {
        display: grid;
        gap: 1.5rem;
      }

      .specs-card__title {
        font-size: 1.125rem;
      }

      .specs {
        display: grid;
        gap: 1rem;
      }

      .specs__row {
        display: grid;
        gap: 0.2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--line);
      }

      .specs__row:last-child {
        padding-bottom: 0;
        border-bottom: 0;
      }

      .specs dt {
        font-size: 0.8125rem;
        color: var(--fg-3);
      }

      .specs dd {
        font-weight: 500;
        color: var(--fg);
      }

      .specs dd.is-accent {
        color: var(--accent);
      }

      .specs dd.mono {
        font-size: 0.9375rem;
      }

      .specs-card__cta {
        display: grid;
        gap: 0.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--line);
      }

      .specs-card__cta p {
        margin-bottom: 0.5rem;
        font-size: 0.9375rem;
      }
    `,
  ],
})
export class LocationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly locationService = inject(LocationService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  readonly location = signal<PaintballLocation | null>(null);
  readonly fieldType = LocationService.fieldType;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      const loc = this.locationService.getLocationById(data['id']);
      if (!loc) return;
      this.location.set(loc);
      this.title.setTitle(loc.title);
      this.meta.updateTag({ name: 'description', content: loc.metaDesc });
    });
  }

  directions(loc: PaintballLocation): string {
    return directionsUrl(loc);
  }

  coords(loc: PaintballLocation): string {
    return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
  }
}
