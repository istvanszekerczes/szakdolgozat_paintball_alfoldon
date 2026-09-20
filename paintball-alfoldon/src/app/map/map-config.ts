import { environment } from '../../environments/environment';

/**
 * Map provider configuration.
 *
 * Secrets never live in source: `environment.ts` is generated from `.env` /
 * process.env by `scripts/set-env.mjs` (see `.env.example`).
 *
 * Resolution order:
 *  1. `MAP_STYLE_URL`     — any MapLibre style.json (full override)
 *  2. `MAPTILER_API_KEY`  — MapTiler "dataviz-dark" style
 *  3. default             — CARTO Dark Matter vector style (free, no key)
 *
 * Whatever the source, the style is recolored to pure black at load time
 * (see `map-style.ts`), so the map always matches the site theme.
 */

export const CARTO_DARK_MATTER_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/** Raster fallback used only when the vector style cannot be fetched. */
export const CARTO_DARK_RASTER_TILES = ['a', 'b', 'c', 'd'].map(
  (s) => `https://${s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`,
);

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

export type MapProvider = 'carto' | 'maptiler' | 'custom';

export interface MapConfig {
  provider: MapProvider;
  styleUrl: string;
}

export function resolveMapConfig(): MapConfig {
  const customStyle = environment.mapStyleUrl.trim();
  if (customStyle) {
    return { provider: 'custom', styleUrl: customStyle };
  }

  const maptilerKey = environment.maptilerApiKey.trim();
  if (maptilerKey) {
    return {
      provider: 'maptiler',
      styleUrl: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${encodeURIComponent(maptilerKey)}`,
    };
  }

  return { provider: 'carto', styleUrl: CARTO_DARK_MATTER_STYLE_URL };
}
