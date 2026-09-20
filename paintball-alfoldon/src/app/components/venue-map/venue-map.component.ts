import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import {
  createBlackMap,
  createMarker,
  createMarkerElement,
  loadMapLibre,
  reframeUntilInteraction,
  setMarkerCaption,
  toLngLat,
  waitForSize,
} from '../../map/map-core';
import { PaintballLocation } from '../../services/location.service';

const VENUE_ZOOM = 15;

/** Single-venue map with a labelled pin, used on the field detail pages. */
@Component({
  selector: 'app-venue-map',
  standalone: true,
  template: `
    <div class="map-shell venue-map-single">
      <div
        #mapContainer
        class="map-shell__canvas"
        role="region"
        [attr.aria-label]="'Térkép: ' + location().city + ', ' + location().venue"
      ></div>

      @switch (status()) {
        @case ('loading') {
          <div class="map-shell__status" aria-live="polite">Térkép betöltése…</div>
        }
        @case ('error') {
          <div class="map-shell__status" role="status">A térkép nem jeleníthető meg ebben a böngészőben.</div>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .venue-map-single {
        height: 380px;
      }

      @media (max-width: 600px) {
        .venue-map-single {
          height: 300px;
        }
      }
    `,
  ],
})
export class VenueMapComponent implements AfterViewInit {
  readonly location = input.required<PaintballLocation>();
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly platformId = inject(PLATFORM_ID);

  private map?: MapLibreMap;
  private marker?: Marker;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.map?.remove());

    // Follow input changes once the map exists (route data can swap without re-creating the page).
    effect(() => {
      const loc = this.location();
      if (this.map) this.moveTo(loc);
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    try {
      const container = this.mapContainer().nativeElement;
      const [ml] = await Promise.all([loadMapLibre(), waitForSize(container)]);
      const loc = this.location();
      const position = toLngLat(loc);

      const map = await createBlackMap(ml, {
        container,
        center: position,
        zoom: VENUE_ZOOM,
        minZoom: 8,
        hideLabels: [loc.city],
      });
      this.map = map;
      // Re-centre the pin if the layout settles late, until the user takes over.
      reframeUntilInteraction(map, () => map.jumpTo({ center: toLngLat(this.location()), zoom: VENUE_ZOOM }));

      // Reveal the canvas once the style is on screen; `load` also waits for every tile.
      map.once('style.load', () => this.status.set('ready'));
      map.once('load', () => this.status.set('ready'));
      map.on('error', (event) => {
        const message = String((event as { error?: { message?: string } }).error?.message ?? '');
        if (this.status() === 'loading' && /webgl/i.test(message)) {
          this.status.set('error');
        }
      });

      this.marker = createMarker(
        ml,
        createMarkerElement({ label: this.caption(loc), caption: this.caption(loc), interactive: false }),
        position,
      ).addTo(map);
    } catch (err) {
      console.error('[map] Failed to initialise the venue map.', err);
      this.status.set('error');
    }
  }

  private moveTo(loc: PaintballLocation): void {
    const position = toLngLat(loc);
    this.map?.jumpTo({ center: position, zoom: VENUE_ZOOM });
    if (this.marker) {
      this.marker.setLngLat(position);
      setMarkerCaption(this.marker.getElement(), this.caption(loc));
      this.marker.getElement().setAttribute('aria-label', this.caption(loc));
    }
  }

  private caption(loc: PaintballLocation): string {
    return `${loc.city} · ${loc.venue}`;
  }
}
