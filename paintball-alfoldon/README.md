# Paintball Alföldön

Marketing site for a paintball operator with seven fields across the Great Hungarian Plain.
Angular 21 (standalone, signals, zoneless) with server-side rendering / prerendering, a dark-only
minimal design system and a MapLibre GL venue map recolored to pure black.

## Quick start

```bash
npm install          # also generates src/environments/environment.ts (see "Configuration")
npm start            # dev server on http://localhost:4200
npm run build        # production build + prerender → dist/paintball_alfoldon
npm test             # unit tests (Vitest)
npm run serve:ssr:paintball_alfoldon   # serve the built SSR app on :4000
```

## Configuration (environment variables)

No configuration is required: the map uses CARTO's free **Dark Matter** vector tiles
(attribution is shown on the map) and recolors them to black at load time.

API keys are never hardcoded. `scripts/set-env.mjs` reads `.env` and `process.env` and writes
`src/environments/environment.ts`, which is git-ignored. It runs automatically on
`npm install`, `npm start`, `npm run build`, `npm run watch` and `npm test`; run `npm run env` to
regenerate it by hand (for example before a bare `ng serve`).

| Variable           | Purpose                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `MAPTILER_API_KEY` | Optional. Switches the basemap to MapTiler's `dataviz-dark` style (still recolored black).  |
| `MAP_STYLE_URL`    | Optional. Any MapLibre-compatible `style.json` URL; overrides both defaults.                |

Copy `.env.example` to `.env` to get started. Real environment variables win over `.env` values,
so CI can inject keys without a file (e.g. `MAPTILER_API_KEY=… npm run build`).

To get a MapTiler key: create a free account at <https://cloud.maptiler.com/>, open
**Account → API keys**, create a key and restrict it to your domain(s).

## Map architecture

```
src/app/map/
  map-config.ts   provider resolution (custom URL → MapTiler → CARTO)
  map-style.ts    fetches the provider style once and recolors every layer to the black theme;
                  falls back to CARTO raster tiles if the vector style cannot be fetched
  map-core.ts     lazy MapLibre loader, themed map factory, marker/popup builders, geo helpers
src/app/components/hungary-map/   overview map + synced venue list (home page)
src/app/components/venue-map/     single-venue map with pinned label (field pages)
```

MapLibre is loaded with a dynamic `import()` inside `isPlatformBrowser` guards, so SSR and
prerendering never touch it.

MapLibre 6 is ESM-only and parses vector tiles in a web worker that it would normally locate
next to its own bundle. That guess fails under bundlers (Vite's dependency cache in `ng serve`,
a hashed chunk in production): the style and attribution load but no tiles ever render.
Therefore `angular.json` copies `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` from
`node_modules/maplibre-gl/dist` into the output root as assets, and `loadMapLibre()` in
`map-core.ts` calls `setWorkerUrl()` with the root-relative worker URL (resolved against
`<base href>`). `src/server.ts` serves both files with `Cache-Control: no-cache` so a MapLibre
upgrade never pairs a stale worker with a new main chunk. If you host the `browser/` folder on a
static CDN instead of the Node server, keep those two files at the site root. After changing
`angular.json` assets, restart `ng serve` so the dev server picks them up. Marker, popup and control styling lives in `src/styles.scss`
(`.pb-marker`, `.pb-popup`, `.maplibregl-*`) because MapLibre renders outside Angular's view
encapsulation. Accent colors come from the site's CSS custom properties.

Behaviour preserved from the previous Leaflet implementation: per-venue markers, a numbered
cluster for the two Szeged fields that splits at zoom 13, hover tooltips, click-to-navigate,
zoom controls, attribution, and the side list that highlights markers on hover. New: keyboard
reachable markers and list rows, Ctrl/⌘ + wheel zoom (no scroll hijacking), Hungarian control
labels, and an "Útvonalterv" directions link on field pages.

## Project layout

```
src/app/
  app.ts / app.html / app.scss   shell: header, venues dropdown, mobile menu, footer
  app.routes.ts                  lazy routes; field pages share LocationComponent via route data
  services/location.service.ts   single source of truth for the seven fields
  pages/                         home, about, faq, gallery, booking, contact, location
  components/                    accordion, contact-form, gallery, hungary-map, venue-map
src/styles.scss                  design tokens, reset, typography, shared components, map theme
```

## Design system notes

- Dark-only. Surfaces `#000 → #1f1f1f`, text `#f2f2f2 / #a8a8a8 / #8a8a8a`, one accent `#4a8fff`.
  Every text/surface pairing meets WCAG AA (weakest ≈ 5.2:1).
- Map theme (`MAP_THEME` in `map-style.ts`): near-black land, roads as faint structure
  (`#141416`–`#3d3d40`, casings carry the overview network), thin `#3a3a3e` country borders with
  the provider's glow halo hidden, deep-blue water, tiered gray labels on black halos, and no
  forest/park fills below zoom 10 so the overview stays calm. Every land surface is neutral gray
  — water is the only colored one, since a hue on forest/grass tints the whole frame at street zoom. Markers are labelled pins
  (`.pb-marker`: blue dot + name chip) and the only saturated element on the map. Venue cities
  are dropped from the basemap's own labels so each name appears once.
- Below 700px the name chips are hidden (the venues sit closer together than the chips are
  wide) and the overview uses a tighter frame; the venue list underneath names every field.
  That breakpoint lives in both `.pb-marker__label` and `LABEL_BREAKPOINT` — change them together.
- Typography: Inter (UI) + JetBrains Mono (labels, coordinates), fluid `clamp()` scale.
- Shared classes: `.container`, `.section`, `.section-head`, `.page-header`, `.card`, `.btn--*`,
  `.pill`, `.stat`, `.eyebrow`, `.field` / `.input`, `.skip-link`, `.sr-only`.
- Motion respects `prefers-reduced-motion`; focus is always visible via `:focus-visible`.
