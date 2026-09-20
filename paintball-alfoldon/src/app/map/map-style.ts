import type { StyleSpecification } from 'maplibre-gl';
import { CARTO_ATTRIBUTION, CARTO_DARK_RASTER_TILES } from './map-config';

/**
 * Black basemap theme.
 *
 * Instead of hand-authoring a 90-layer style, we fetch the provider's dark
 * style and recolor every layer by category before handing it to MapLibre.
 * This keeps the provider's road hierarchy, zoom stops and label placement
 * while forcing everything into a restrained near-black palette: land is the
 * backdrop, roads and borders are faint structure, water is a deep blue, and
 * the site's markers are the only saturated element.
 */
/**
 * Camera expression: `before` under `zoom`, `after` from `zoom` on. Road casings
 * are the only representation of a road until its fill layer kicks in, so they
 * must read as the road itself below that zoom and as a dark outline above it.
 */
function stepAt(zoom: number, before: string, after: string): unknown[] {
  return ['step', ['zoom'], before, zoom, after];
}

export const MAP_THEME = {
  background: '#000000',
  land: '#0b0b0c',
  landuse: '#131316',
  // Neutral, not green: forest/grass cover large areas at street zoom, and any
  // hue there tints the whole frame. Water is the only colored surface.
  park: '#101012',
  water: '#0d1826',
  waterLine: '#1e3856',
  building: '#1a1a1d',
  buildingOutline: '#0b0b0c',
  // Fills (from the zoom where the provider draws them) …
  roadMajor: '#4a4a50',
  roadPrimary: '#3c3c41',
  roadSecondary: '#333338',
  roadMinor: '#2a2a2e',
  // … and casings: road-colored until the fill exists (major/primary z10, secondary z13,
  // minor z15), then a dark outline.
  roadMajorCase: stepAt(10, '#34343a', '#222226'),
  roadPrimaryCase: stepAt(10, '#2c2c30', '#1e1e22'),
  roadSecondaryCase: stepAt(13, '#2a2a2e', '#1a1a1d'),
  roadMinorCase: stepAt(15, '#222226', '#121214'),
  path: '#202024',
  rail: '#252528',
  railDash: '#121214',
  aeroway: '#1c1c1f',
  boundary: '#26262a',
  boundaryCountry: '#3a3a3e',
  text: '#8a8a90',
  textStrong: '#b4b4ba',
  textMuted: '#5c5c62',
  halo: '#000000',
  icon: '#5c5c62',
} as const;

/** Forest/grass/park/land-use fills only appear from this zoom; at overview zooms they read as noise. */
export const LANDCOVER_MIN_ZOOM = 10;

export interface BlackThemeOptions {
  /**
   * Place names whose basemap labels should be suppressed — the site draws its
   * own labelled pins for venue cities and a second label would duplicate them.
   */
  hideLabels?: readonly string[];
}

/** Loose view of a style layer — the spec's discriminated union is unwieldy for generic recoloring. */
interface LooseLayer {
  id: string;
  type: string;
  'source-layer'?: string;
  minzoom?: number;
  filter?: unknown;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

const TRANSPARENT_RE = /^(transparent|rgba\([^)]*,\s*0(\.0+)?\s*\))$/i;

function isTransparentColor(value: unknown): boolean {
  if (typeof value === 'string') {
    return TRANSPARENT_RE.test(value.trim());
  }
  // Legacy zoom function: { stops: [[zoom, color], ...] }
  if (value && typeof value === 'object' && Array.isArray((value as { stops?: unknown }).stops)) {
    const stops = (value as { stops: unknown[] }).stops;
    return stops.every((stop) => Array.isArray(stop) && isTransparentColor(stop[1]));
  }
  return false;
}

/** `color` is a CSS color string or a MapLibre camera expression (see `stepAt`). */
function setColor(paint: Record<string, unknown>, key: string, color: unknown): void {
  // Keep intentionally invisible fills invisible (e.g. buildings below z16).
  if (key in paint && isTransparentColor(paint[key])) return;
  paint[key] = color;
}

/** Legacy-syntax filter (matching CARTO's own filters) that drops features with the given names. */
function excludeNames(layer: LooseLayer, names: readonly string[]): void {
  const exclusion: unknown[] = ['!in', 'name', ...names];
  layer.filter = layer.filter ? ['all', layer.filter, exclusion] : exclusion;
}

function recolorLayer(layer: LooseLayer, options: BlackThemeOptions): void {
  const id = layer.id.toLowerCase();
  const has = (...needles: string[]) => needles.some((n) => id.includes(n));
  const paint = (layer.paint ??= {});
  const layout = (layer.layout ??= {});
  const T = MAP_THEME;

  switch (layer.type) {
    case 'background':
      paint['background-color'] = T.background;
      break;

    case 'fill': {
      let color: string = T.land;
      if (has('water')) color = T.water;
      else if (has('park', 'wood', 'forest', 'grass', 'nature', 'national', 'green', 'landcover')) {
        color = T.park;
        layer.minzoom = Math.max(layer.minzoom ?? 0, LANDCOVER_MIN_ZOOM);
      } else if (has('building')) color = T.building;
      else if (has('landuse', 'residential', 'industrial')) {
        color = T.landuse;
        layer.minzoom = Math.max(layer.minzoom ?? 0, LANDCOVER_MIN_ZOOM);
      }

      setColor(paint, 'fill-color', color);
      if ('fill-outline-color' in paint) {
        setColor(paint, 'fill-outline-color', has('building') ? T.buildingOutline : color);
      }
      break;
    }

    case 'line': {
      let color: unknown;
      if (has('water')) color = T.waterLine;
      else if (has('boundary', 'admin', 'border')) {
        // The wide, half-transparent border "outline" is a glow halo — not part of this look.
        if (has('outline')) {
          layout['visibility'] = 'none';
          break;
        }
        color = has('country') ? T.boundaryCountry : T.boundary;
      } else if (has('rail', 'transit', 'ferry')) color = has('dash') ? T.railDash : T.rail;
      else if (has('aeroway', 'runway', 'taxiway')) color = T.aeroway;
      else if (has('path', 'footway', 'track', 'pedestrian', 'cycle')) color = T.path;
      else {
        const casing = has('case', 'casing', 'outline');
        if (has('mot', 'trunk', 'highway', 'major')) color = casing ? T.roadMajorCase : T.roadMajor;
        else if (has('pri')) color = casing ? T.roadPrimaryCase : T.roadPrimary;
        else if (has('sec', 'tertiary')) color = casing ? T.roadSecondaryCase : T.roadSecondary;
        else color = casing ? T.roadMinorCase : T.roadMinor;
      }

      setColor(paint, 'line-color', color);
      break;
    }

    case 'symbol': {
      // Points of interest and house numbers add clutter on a venue map — hide them.
      if (has('poi', 'housenumber', 'house_number')) {
        layout['visibility'] = 'none';
        break;
      }
      // Venue cities get their label from the pin; drop the basemap's copy.
      if (options.hideLabels?.length && (layer['source-layer'] === 'place' || has('place'))) {
        excludeNames(layer, options.hideLabels);
      }
      let color: string = T.text;
      if (has('city', 'capital', 'town')) color = T.textStrong;
      else if (has('country', 'state', 'continent', 'roadname', 'road_label', 'ocean', 'sea')) color = T.textMuted;

      paint['text-color'] = color;
      paint['text-halo-color'] = T.halo;
      paint['text-halo-width'] = Math.max(Number(paint['text-halo-width']) || 0, 1.4);
      if ('icon-color' in paint) paint['icon-color'] = T.icon;
      break;
    }

    case 'raster':
      paint['raster-saturation'] = -1;
      paint['raster-brightness-max'] = 0.7;
      break;

    default:
      // fill-extrusion, hillshade, heatmap, circle: leave untouched.
      break;
  }
}

/** Returns a deep-copied style with every layer recolored to the black theme. */
export function applyBlackTheme(style: StyleSpecification, options: BlackThemeOptions = {}): StyleSpecification {
  const themed = structuredClone(style);
  for (const layer of themed.layers as unknown as LooseLayer[]) {
    recolorLayer(layer, options);
  }
  themed.name = `${style.name ?? 'Basemap'} — Black`;
  return themed;
}

/** Minimal raster style used when the vector style cannot be fetched (offline, blocked, 5xx). */
export function fallbackBlackStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'Fallback — Black (raster)',
    sources: {
      carto: {
        type: 'raster',
        tiles: CARTO_DARK_RASTER_TILES,
        tileSize: 256,
        maxzoom: 20,
        attribution: CARTO_ATTRIBUTION,
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': MAP_THEME.background } },
      {
        id: 'carto-dark',
        type: 'raster',
        source: 'carto',
        paint: { 'raster-saturation': -1, 'raster-brightness-max': 0.7, 'raster-contrast': 0.15 },
      },
    ],
  };
}

const styleCache = new Map<string, Promise<StyleSpecification>>();

/**
 * Fetches + themes a style once per URL and option set (shared between the home
 * map and the venue pages). Never rejects: falls back to the raster style on any failure.
 */
export function loadBlackStyle(styleUrl: string, options: BlackThemeOptions = {}): Promise<StyleSpecification> {
  const key = `${styleUrl}|${[...(options.hideLabels ?? [])].sort().join(',')}`;
  let pending = styleCache.get(key);
  if (!pending) {
    pending = fetchStyle(styleUrl)
      .then((style) => applyBlackTheme(style, options))
      .catch((err: unknown) => {
        console.warn('[map] Could not load vector style, using raster fallback.', err);
        styleCache.delete(key); // allow a retry on the next map instance
        return fallbackBlackStyle();
      });
    styleCache.set(key, pending);
  }
  return pending;
}

async function fetchStyle(url: string): Promise<StyleSpecification> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
    if (!res.ok) throw new Error(`Style request failed with HTTP ${res.status}`);
    return (await res.json()) as StyleSpecification;
  } finally {
    clearTimeout(timeout);
  }
}
