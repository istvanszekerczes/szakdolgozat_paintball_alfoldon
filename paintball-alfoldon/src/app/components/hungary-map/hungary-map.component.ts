import { Location, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import type { Map as MapLibreMap, Marker, PaddingOptions, Popup } from 'maplibre-gl';
import {
  MapLibre,
  boundsOf,
  centroidOf,
  createBlackMap,
  createMarker,
  createMarkerElement,
  createPopup,
  createPopupContent,
  loadMapLibre,
  prefersReducedMotion,
  reframeUntilInteraction,
  toLngLat,
  waitForSize,
} from '../../map/map-core';
import { LocationService, PaintballLocation } from '../../services/location.service';

/** Below this zoom, venues that share a city collapse into one numbered marker. */
const CLUSTER_SPLIT_ZOOM = 13;

/**
 * Zoom used when the user picks a place — from the list or from a cluster badge.
 * Past `CLUSTER_SPLIT_ZOOM` so a shared city breaks into its individual pins.
 */
const FOCUS_ZOOM = CLUSTER_SPLIT_ZOOM + 0.5;

/**
 * Gentle cubic ease-in-out. MapLibre's default easing leaves the start of a
 * move faster than its end, which on a six-zoom-level flight reads as a lurch.
 */
const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Container width (px) above which pins carry a name chip — keep in sync with `.pb-marker__label`. */
const LABEL_BREAKPOINT = 700;

interface Cluster {
  city: string;
  venues: PaintballLocation[];
  center: [number, number];
  marker: Marker;
}

type MapStatus = 'loading' | 'ready' | 'error';

/**
 * Overview map of every field (home page). Markers, a city cluster and the
 * side list are kept in sync: hovering/focusing one highlights the other.
 *
 * The list is a browser — picking a row frames that venue on the map — and the
 * map is the way through: clicking a pin opens the venue's page.
 */
@Component({
  selector: 'app-hungary-map',
  standalone: true,
  templateUrl: './hungary-map.component.html',
  styleUrl: './hungary-map.component.scss',
})
export class HungaryMapComponent implements AfterViewInit {
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly venues = inject(LocationService).getLocations();
  readonly fieldType = LocationService.fieldType;
  readonly status = signal<MapStatus>('loading');

  /** Venue under the cursor/focus right now — transient. */
  private readonly hovered = signal<PaintballLocation | null>(null);
  /** Venue the user picked from the list; its pin stays marked after the camera settles. */
  private readonly selected = signal<PaintballLocation | null>(null);

  /** Row to mark in the list: a hover takes precedence over the picked venue. */
  readonly activeId = computed(() => (this.hovered() ?? this.selected())?.id ?? null);

  private ml?: MapLibre;
  private map?: MapLibreMap;
  private popup?: Popup;
  private readonly markers = new Map<string, Marker>();
  private readonly clusters: Cluster[] = [];
  private readonly onMap = new Set<Marker>();
  private framing?: { stop: () => void };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.popup?.remove();
      this.map?.remove();
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.initMap();
    }
  }

  /* ------------------------------------------------------------ list events */

  onLegendEnter(venue: PaintballLocation): void {
    this.hovered.set(venue);
    this.paint(venue);
  }

  onLegendLeave(): void {
    this.hovered.set(null);
    this.restore();
  }

  /**
   * The row is a real `<a href>` — it survives without JavaScript, keeps the home
   * page linking to every venue for crawlers, and a modified click still opens
   * the page in a new tab, because those paths are left to the browser.
   *
   * Deliberately not a `routerLink`: that directive navigates programmatically
   * from its own click listener, so `preventDefault()` cannot call it off. Owning
   * the href means a plain click can do what it should here — frame the venue on
   * the map, and let its pin be the way through to the page.
   */
  hrefFor(venue: PaintballLocation): string {
    return this.location.prepareExternalUrl(`/${venue.id}`);
  }

  onLegendClick(event: MouseEvent, venue: PaintballLocation): void {
    // Leave new-tab/new-window clicks to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (this.map && this.status() === 'ready') this.focus(venue);
    // No map to frame anything on — do what the link says instead.
    else void this.router.navigate(['/', venue.id]);
  }

  /* ------------------------------------------------------------------ setup */

  private async initMap(): Promise<void> {
    try {
      const container = this.mapContainer().nativeElement;
      const bounds = boundsOf(this.venues);
      const fit = () => this.fitOptions();

      const [ml] = await Promise.all([loadMapLibre(), waitForSize(container)]);
      this.ml = ml;
      const map = await createBlackMap(ml, {
        container,
        bounds,
        fitBoundsOptions: fit(),
        minZoom: 6,
        // Venue cities are labelled by their pins; keep the basemap from labelling them twice.
        hideLabels: [...new Set(this.venues.map((v) => v.city))],
      });
      this.map = map;
      this.popup = createPopup(ml);
      // Keep every venue in frame if the layout settles late or the window is
      // resized across the label breakpoint, until the user takes over.
      this.framing = reframeUntilInteraction(map, () => map.fitBounds(bounds, { ...fit(), duration: 0 }));

      // Reveal the canvas as soon as the (black) style is on screen; `load` additionally
      // waits for every initial tile, which a single slow request could delay indefinitely.
      map.once('style.load', () => this.status.set('ready'));
      map.once('load', () => this.status.set('ready'));
      map.on('error', (event) => {
        // Tile 404s also surface here; only a failed GL context is fatal.
        const message = String((event as { error?: { message?: string } }).error?.message ?? '');
        if (this.status() === 'loading' && /webgl/i.test(message)) {
          this.status.set('error');
        }
      });

      this.buildMarkers(map);
      // `zoom`, not `zoomend`: a cluster that only breaks apart on the last frame
      // of a flight pops. Following the zoom lets it split as the threshold is
      // crossed, mid-move. `setOnMap` dedupes, so most frames touch no DOM.
      map.on('zoom', () => this.syncClusters());
      // A click on open map means "never mind" — drop the pick so the list and
      // the popup stop pointing at a venue the user has moved on from.
      map.on('click', () => {
        this.selected.set(null);
        this.restore();
      });
      this.syncClusters();
    } catch (err) {
      console.error('[map] Failed to initialise the overview map.', err);
      this.status.set('error');
    }
  }

  private buildMarkers(map: MapLibreMap): void {
    const ml = this.ml!;

    const byCity = new Map<string, PaintballLocation[]>();
    for (const venue of this.venues) {
      byCity.set(venue.city, [...(byCity.get(venue.city) ?? []), venue]);
    }

    for (const venue of this.venues) {
      // Cities with one field are labelled by city; split-out cluster members by venue name.
      const shared = (byCity.get(venue.city)?.length ?? 1) > 1;
      const el = createMarkerElement({
        label: `${venue.city} – ${venue.venue}`,
        caption: shared ? venue.venue : venue.city,
      });
      el.addEventListener('mouseenter', () => this.onLegendEnter(venue));
      el.addEventListener('focus', () => this.onLegendEnter(venue));
      el.addEventListener('mouseleave', () => this.onLegendLeave());
      el.addEventListener('blur', () => this.onLegendLeave());
      el.addEventListener('click', () => void this.router.navigate(['/', venue.id]));
      this.markers.set(venue.id, createMarker(ml, el, toLngLat(venue)));
    }

    for (const [city, venues] of byCity) {
      if (venues.length < 2) continue;
      const center = centroidOf(venues);
      const el = createMarkerElement({
        label: `${city} – ${venues.length} helyszín, kattints a nagyításhoz`,
        caption: city,
        count: venues.length,
      });
      const cluster: Cluster = { city, venues, center, marker: createMarker(ml, el, center) };

      const show = () => {
        this.clearPaint();
        el.classList.add('is-active');
        this.showPopup(center, {
          eyebrow: `${venues.length} helyszín`,
          title: city,
          meta: venues.map((v) => v.venue).join(' · '),
        });
      };
      el.addEventListener('mouseenter', show);
      el.addEventListener('focus', show);
      el.addEventListener('mouseleave', () => this.onLegendLeave());
      el.addEventListener('blur', () => this.onLegendLeave());
      el.addEventListener('click', () => {
        this.selected.set(null);
        this.hovered.set(null);
        this.clearPaint();
        this.framing?.stop(); // the user chose this view; don't snap back on resize
        this.fly(center, FOCUS_ZOOM);
      });
      this.clusters.push(cluster);
    }
  }

  /** Shows either the cluster badge or the individual markers, depending on zoom. */
  private syncClusters(): void {
    const map = this.map;
    if (!map) return;

    const split = map.getZoom() >= CLUSTER_SPLIT_ZOOM;
    const hidden = new Set<string>();

    for (const cluster of this.clusters) {
      this.setOnMap(cluster.marker, !split);
      if (!split) cluster.venues.forEach((v) => hidden.add(v.id));
    }
    for (const [id, marker] of this.markers) {
      this.setOnMap(marker, !hidden.has(id));
    }
  }

  private setOnMap(marker: Marker, visible: boolean): void {
    const map = this.map;
    if (!map) return;
    if (visible && !this.onMap.has(marker)) {
      marker.addTo(map);
      this.onMap.add(marker);
    } else if (!visible && this.onMap.has(marker)) {
      marker.remove();
      this.onMap.delete(marker);
    }
  }

  /* -------------------------------------------------------------- highlight */

  /**
   * Flies to a venue and leaves its pin marked. The zoom is deliberately past
   * `CLUSTER_SPLIT_ZOOM`: for a city with several fields the badge has to break
   * apart, or the pin the user is meant to click next would never appear.
   */
  private focus(venue: PaintballLocation): void {
    const map = this.map;
    if (!map) return;

    this.framing?.stop(); // the user chose this view; don't snap back on resize
    this.hovered.set(null);
    this.selected.set(venue);

    // Registered before the move: under reduced motion `fly` jumps, and a jump
    // fires `moveend` synchronously — a listener added afterwards would miss it.
    map.once('moveend', () => {
      if (!this.hovered() && this.selected() === venue) this.restore();
    });
    this.fly(toLngLat(venue), Math.max(map.getZoom(), FOCUS_ZOOM));
  }

  /**
   * Camera move for "show me this one".
   *
   * `flyTo` follows MapLibre's optimal path — zoom arcs out and back in while
   * the centre travels — instead of `easeTo`'s straight interpolation, which on
   * a jump from countrywide to street level reads as a punch rather than one
   * continuous move. Duration is left to MapLibre so that it scales with the
   * distance covered: a hop to the next city stays brief and a long haul gets
   * the time it needs. `speed` is what paces it.
   *
   * Deliberately no `maxDuration`: it does not clamp a long flight, it cancels
   * it — MapLibre sets `duration = 0` when the computed time exceeds it, so the
   * map would snap precisely on the moves that most need the animation.
   */
  private fly(center: [number, number], zoom: number): void {
    const map = this.map;
    if (!map) return;

    if (prefersReducedMotion()) {
      map.jumpTo({ center, zoom });
      return;
    }
    // speed 2.2 puts a countrywide move at ~1.4s and a short hop at ~1.2s:
    // unmistakably a move rather than a cut, without becoming a wait.
    map.flyTo({ center, zoom, curve: 1.42, speed: 2.2, easing: easeInOutCubic });
  }

  /** Repaints whatever should be marked now — used when a transient hover ends. */
  private restore(): void {
    const venue = this.hovered() ?? this.selected();
    if (venue) this.paint(venue);
    else this.clearPaint();
  }

  /**
   * Marks a venue's pin and labels it. Deliberately moves no camera: the map
   * only travels when the user asks it to by clicking. Panning on hover meant
   * that once a venue was framed, sweeping down the list dragged the map from
   * one end of the country to the other.
   */
  private paint(venue: PaintballLocation): void {
    const map = this.map;
    if (!map) return;

    this.clearPaint();
    const cluster = this.clusters.find((c) => c.venues.includes(venue));
    const collapsed = !!cluster && map.getZoom() < CLUSTER_SPLIT_ZOOM;
    const target = collapsed ? cluster.marker : this.markers.get(venue.id);
    const position: [number, number] = collapsed ? cluster.center : toLngLat(venue);

    target?.getElement().classList.add('is-active');
    this.showPopup(position, {
      eyebrow: venue.venue,
      title: venue.city,
      meta: `${this.fieldType(venue)} · ${venue.optHeadcount} fő`,
    });
  }

  private clearPaint(): void {
    this.popup?.remove();
    for (const marker of this.markers.values()) marker.getElement().classList.remove('is-active');
    for (const cluster of this.clusters) cluster.marker.getElement().classList.remove('is-active');
  }

  private showPopup(position: [number, number], content: Parameters<typeof createPopupContent>[0]): void {
    if (!this.map || !this.popup) return;
    this.popup.setLngLat(position).setDOMContent(createPopupContent(content)).addTo(this.map);
  }

  /**
   * Padding must leave room for whatever sits next to a pin. Wide viewports
   * show label chips to the right of each pin; narrow ones hide them, so the
   * frame can be tight and the country fills the box instead of shrinking to
   * fit padding. The media query is the source of truth for which applies.
   */
  private fitOptions(): { padding: PaddingOptions; maxZoom: number } {
    const labelled = !window.matchMedia(`(max-width: ${LABEL_BREAKPOINT}px)`).matches;
    return {
      // A pin's ring reaches ~22px from its coordinate, and the attribution bar
      // sits along the bottom edge, so even the tight frame keeps clear of both.
      padding: labelled
        ? { top: 56, right: 150, bottom: 56, left: 56 }
        : { top: 48, right: 48, bottom: 72, left: 48 },
      maxZoom: 9,
    };
  }
}
