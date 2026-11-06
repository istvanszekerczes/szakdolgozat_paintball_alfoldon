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
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import {
  MAP_LOCALES,
  createBlackMap,
  createMarker,
  createMarkerElement,
  loadMapLibre,
  reframeUntilInteraction,
  setMarkerCaption,
  toLngLat,
  trackMapLoad,
  waitForSize,
} from '../../map/map-core';
import { PaintballLocation } from '../../models/paintball-location';

const VENUE_ZOOM = 15;

/** Single-venue map with a labelled pin, used on the field detail pages. */
@Component({
  selector: 'app-venue-map',
  imports: [TranslatePipe],
  templateUrl: './venue-map.html',
  styleUrl: './venue-map.scss',
})
export class VenueMap implements AfterViewInit {
  readonly location = input.required<PaintballLocation>();
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private platformId = inject(PLATFORM_ID);
  private translationService = inject(TranslationService);

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
        locale: MAP_LOCALES[this.translationService.language()],
      });
      this.map = map;
      // Re-centre the pin if the layout settles late, until the user takes over.
      reframeUntilInteraction(map, () =>
        map.jumpTo({ center: toLngLat(this.location()), zoom: VENUE_ZOOM }),
      );

      trackMapLoad(map, (status) => this.status.set(status));

      this.marker = createMarker(
        ml,
        createMarkerElement({
          label: this.caption(loc),
          caption: this.caption(loc),
          interactive: false,
        }),
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
