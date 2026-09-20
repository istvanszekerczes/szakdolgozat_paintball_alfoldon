import { isDevMode } from '@angular/core';
import type {
  LngLatBoundsLike,
  LngLatLike,
  Map as MapLibreMap,
  MapOptions,
  Marker,
  Popup,
  PopupOptions,
} from 'maplibre-gl';
import { resolveMapConfig } from './map-config';
import { loadBlackStyle } from './map-style';

/**
 * Shared MapLibre plumbing for every map on the site.
 *
 * MapLibre touches `window` at import time, so it is loaded lazily and only in
 * the browser — components must guard with `isPlatformBrowser` before calling
 * anything in here. Type-only imports above are erased at compile time.
 */

export type MapLibre = typeof import('maplibre-gl');

/**
 * MapLibre 6 (ESM) runs tile parsing in a web worker that it normally locates
 * relative to its own bundle URL. That guess breaks under bundlers: in
 * `ng serve` the library is served from Vite's dependency cache, in production
 * from a hashed chunk — neither directory contains the worker file. We ship
 * the worker and its shared chunk as static assets at the site root (see
 * `angular.json`) and point MapLibre at them explicitly. Without a working
 * worker the style loads but no vector tiles are ever rendered.
 */
export const MAPLIBRE_WORKER_FILE = 'maplibre-gl-worker.mjs';

let libPromise: Promise<MapLibre> | undefined;

/** Loads MapLibre GL once (ESM namespace — v6 has no default export) and wires up its worker. */
export function loadMapLibre(): Promise<MapLibre> {
  libPromise ??= import('maplibre-gl').then((ml) => {
    // Respect <base href> so the app also works when deployed under a sub-path.
    ml.setWorkerUrl(new URL(MAPLIBRE_WORKER_FILE, document.baseURI).href);
    return ml;
  });
  return libPromise;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Resolves once the container has a real size (or after ~half a second). A map
 * created in a 0×0 or half-laid-out box fits its bounds wrongly and never recovers.
 */
export function waitForSize(el: HTMLElement, maxFrames = 30): Promise<void> {
  return new Promise((resolve) => {
    let frames = 0;
    const check = () => {
      if ((el.clientWidth > 0 && el.clientHeight > 0) || frames++ >= maxFrames) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * Calls `reframe` whenever the map container is resized before the user has
 * touched the map (late CSS/font layout, orientation change). Once the user
 * pans or zooms — or the caller reports an interaction via the returned
 * `stop()` — their view is left alone.
 */
export function reframeUntilInteraction(map: MapLibreMap, reframe: () => void): { stop: () => void } {
  let touched = false;
  const stop = () => {
    touched = true;
  };
  map.on('movestart', (event) => {
    if ((event as { originalEvent?: unknown }).originalEvent) stop();
  });
  map.on('resize', () => {
    if (!touched) reframe();
  });
  return { stop };
}

/**
 * Dev-only: exposes the map instance on its container (`container.__map`) so it
 * can be inspected from the browser console or automated checks. Stripped from
 * production builds.
 */
export function exposeForDebugging(map: MapLibreMap, container: HTMLElement): void {
  if (isDevMode()) {
    Object.defineProperty(container, '__map', { value: map, configurable: true });
  }
}

/** Hungarian UI strings for MapLibre's built-in controls and overlays. */
export const HU_LOCALE: Record<string, string> = {
  'Map.Title': 'Térkép',
  'Marker.Title': 'Térképjelölő',
  'Popup.Close': 'Bezárás',
  'NavigationControl.ZoomIn': 'Nagyítás',
  'NavigationControl.ZoomOut': 'Kicsinyítés',
  'NavigationControl.ResetBearing': 'Északra forgatás',
  'AttributionControl.ToggleAttribution': 'Forrásmegjelölés megjelenítése',
  'CooperativeGesturesHandler.WindowsHelpText': 'A térkép nagyításához használd a Ctrl + görgetést',
  'CooperativeGesturesHandler.MacHelpText': 'A térkép nagyításához használd a ⌘ + görgetést',
  'CooperativeGesturesHandler.MobileHelpText': 'A térkép mozgatásához használj két ujjat',
};

export interface BlackMapOptions {
  container: HTMLElement;
  center?: LngLatLike;
  zoom?: number;
  bounds?: LngLatBoundsLike;
  fitBoundsOptions?: MapOptions['fitBoundsOptions'];
  minZoom?: number;
  maxZoom?: number;
  /** Ctrl/⌘ + wheel to zoom and two-finger pan on touch, so the map never hijacks page scrolling. */
  cooperativeGestures?: boolean;
  /** Basemap place labels to suppress (cities that get a labelled pin instead). */
  hideLabels?: readonly string[];
}

/**
 * Creates a map with the black theme applied, zoom controls and compact
 * attribution. Rotation/pitch are disabled: this is a 2D venue map.
 */
export async function createBlackMap(ml: MapLibre, opts: BlackMapOptions): Promise<MapLibreMap> {
  const style = await loadBlackStyle(resolveMapConfig().styleUrl, { hideLabels: opts.hideLabels });

  const options: MapOptions = {
    container: opts.container,
    style,
    attributionControl: false,
    cooperativeGestures: opts.cooperativeGestures ?? true,
    minZoom: opts.minZoom ?? 5,
    maxZoom: opts.maxZoom ?? 18,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    locale: HU_LOCALE,
    fadeDuration: prefersReducedMotion() ? 0 : 300,
  };
  // Only forward camera options that were actually provided; MapLibre treats an
  // explicit `undefined` as an override of its defaults.
  if (opts.center) options.center = opts.center;
  if (opts.zoom !== undefined) options.zoom = opts.zoom;
  if (opts.bounds) {
    options.bounds = opts.bounds;
    if (opts.fitBoundsOptions) options.fitBoundsOptions = opts.fitBoundsOptions;
  }

  const map = new ml.Map(options);
  map.touchZoomRotate.disableRotation();
  map.addControl(new ml.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');
  map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-right');
  exposeForDebugging(map, opts.container);
  return map;
}

/* ---------------------------------------------------------------- markers */

export interface MarkerElementOptions {
  /** Accessible name; also used as the tooltip for mouse users. */
  label: string;
  /** Visible name chip rendered next to the pin (city / venue). */
  caption?: string;
  /** Renders a numbered cluster badge instead of a dot. */
  count?: number;
  /** Interactive markers are real `<button>`s (keyboard reachable); others are decorative images. */
  interactive?: boolean;
}

/** Square hit area of the pin; the label chip extends to its right. */
export const MARKER_PIN_SIZE = 44;

/**
 * Builds the DOM for a themed marker: `[pin][caption]`. Styles live in
 * `styles.scss` (`.pb-marker`).
 */
export function createMarkerElement({ label, caption, count, interactive = true }: MarkerElementOptions): HTMLElement {
  const el = document.createElement(interactive ? 'button' : 'div');
  if (el instanceof HTMLButtonElement) {
    el.type = 'button';
  } else {
    el.setAttribute('role', 'img');
  }
  el.className = count ? 'pb-marker pb-marker--cluster' : 'pb-marker';
  el.setAttribute('aria-label', label);
  el.title = label;

  const pin = document.createElement('span');
  pin.className = 'pb-marker__pin';
  pin.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('span');
  ring.className = 'pb-marker__ring';

  const dot = document.createElement('span');
  dot.className = 'pb-marker__dot';
  if (count) dot.textContent = String(count);

  pin.append(ring, dot);
  el.append(pin);

  if (caption) {
    const chip = document.createElement('span');
    chip.className = 'pb-marker__label';
    chip.setAttribute('aria-hidden', 'true');
    chip.textContent = caption;
    el.append(chip);
  }
  return el;
}

export function setMarkerCaption(element: HTMLElement, caption: string): void {
  const chip = element.querySelector('.pb-marker__label');
  if (chip) chip.textContent = caption;
}

/** Places the marker so the pin centre (not the centre of pin + chip) sits on the coordinate. */
export function createMarker(ml: MapLibre, element: HTMLElement, lngLat: LngLatLike): Marker {
  return new ml.Marker({ element, anchor: 'left', offset: [-MARKER_PIN_SIZE / 2, 0] }).setLngLat(lngLat);
}

/* ----------------------------------------------------------------- popups */

export interface PopupContent {
  eyebrow?: string;
  title: string;
  meta?: string;
}

export function createPopupContent({ eyebrow, title, meta }: PopupContent): HTMLElement {
  const body = document.createElement('div');
  body.className = 'pb-popup__body';

  if (eyebrow) {
    const e = document.createElement('span');
    e.className = 'pb-popup__eyebrow';
    e.textContent = eyebrow;
    body.append(e);
  }

  const t = document.createElement('strong');
  t.className = 'pb-popup__title';
  t.textContent = title;
  body.append(t);

  if (meta) {
    const m = document.createElement('span');
    m.className = 'pb-popup__meta';
    m.textContent = meta;
    body.append(m);
  }
  return body;
}

/** Hover/label popup: no close button, never steals focus, themed via `.pb-popup`. */
export function createPopup(ml: MapLibre, options: Pick<PopupOptions, 'offset' | 'anchor'> = {}): Popup {
  return new ml.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    className: 'pb-popup',
    maxWidth: '280px',
    offset: 22,
    ...options,
  });
}

/* ------------------------------------------------------------- geometry */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export function toLngLat(p: GeoPoint): [number, number] {
  return [p.lng, p.lat];
}

export function boundsOf(points: readonly GeoPoint[]): LngLatBoundsLike {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const p of points) {
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function centroidOf(points: readonly GeoPoint[]): [number, number] {
  const n = points.length || 1;
  const sum = points.reduce((acc, p) => [acc[0] + p.lng, acc[1] + p.lat], [0, 0]);
  return [sum[0] / n, sum[1] / n];
}

/** Google Maps directions deep link (opens the user's preferred maps app on mobile). */
export function directionsUrl(p: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
}
