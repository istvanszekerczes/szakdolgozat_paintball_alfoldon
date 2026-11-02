# Paintball Alföldön

Marketing site for a paintball operator with seven fields across the Great Hungarian Plain.
Angular 22 (standalone, signals, zoneless) with server-side rendering / prerendering, a dark-only
minimal design system and a MapLibre GL venue map recolored to pure black.

The workspace has two Angular CLI projects: the public site (`paintball_alfoldon`, used by default
from the workspace root) and the admin dashboard (`paintball-alfoldon-dashboard`, in
`apps/paintball-alfoldon-dashboard`). Node.js `^22.22.3`, `^24.15.0` or `>=26` is required.

## Features

- Public site: home page with a venue map, a page for each of the seven fields, FAQ, gallery and contact details, and a 404 page.
- Online booking at `/foglalas`: pick a field, date, free slot and group size, enter contact details, review and send.
- Admin dashboard: incoming bookings, accept or reject, calendar, day schedule with cars and staff, fields and blocked
  dates, employees, cars.
- Backend: Spring Boot REST API with PostgreSQL. It checks every booking rule again, so the frontends can't bypass them.

Screenshots are in `docs/screenshots/`.

## Quick start

```bash
npm install          # also generates src/environments/environment.ts (see "Configuration")
npm test             # unit tests of both apps (Vitest)
```

Public site:

```bash
npm start            # dev server on http://localhost:4200
npm run build        # production build + prerender → dist/paintball_alfoldon
npm run serve:ssr:paintball_alfoldon   # serve the built SSR app on :4000
```

The booking wizard needs the backend on http://localhost:8080 (see "Booking wizard").

Admin dashboard (expects the backend on http://localhost:8080):

```bash
npm run start:dashboard      # dev server on http://localhost:4300
npm run build:dashboard      # production build → dist/apps/paintball-alfoldon-dashboard
npm run test:dashboard       # dashboard unit tests only
npm run serve:ssr:dashboard  # serve the built SSR app (uses PORT, default 4000)
```

## Allowed hosts

The SSR servers answer requests for hosts that are not on the allowlist with `400 Bad Request`.
`security.allowedHosts` of each project in `angular.json` lists `localhost` and that app's
production domains. To allow another host, add it there or set `NG_ALLOWED_HOSTS` on the server. See
<https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf>.

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
| `API_URL`          | Optional. Backend base URL for the booking wizard, without a trailing slash. See below.     |

Copy `.env.example` to `.env` to get started. Real environment variables win over `.env` values,
so CI can inject keys without a file (e.g. `MAPTILER_API_KEY=… npm run build`).

To get a MapTiler key: create a free account at <https://cloud.maptiler.com/>, open
**Account → API keys**, create a key and restrict it to your domain(s).

## Rendering

`src/app/app.routes.server.ts` prerenders every real page. Any other URL renders the 404 page on the server and
answers with status 404, so production needs the Node server (`dist/paintball_alfoldon/server/server.mjs`) for that.
A new page must be added to both `app.routes.ts` and `app.routes.server.ts`; a test checks that they match.

Group limits per field live in the database (`V2__seed_venues.sql`), and the wizard enforces them through the API.
`location.service.ts` holds a copy for the static pages; a test checks that it matches.

## Booking wizard

`/foglalas` is a five-step wizard: field → date and slot → group → contact → summary. Venue pages link to it
with `?palya=<slug>`, which preselects the field and starts on the date step. The code is in
`src/app/features/booking/`. One Signal Form holds the whole booking, and each step validates its own fields
before moving on. The page shell is prerendered, and the wizard itself loads in the browser through `@defer`.

It uses three public endpoints: `GET /api/venues`, `GET /api/venues/{slug}/availability?date=` and
`POST /api/bookings`. Refusals come back as ProblemDetail: 400 (with an `errors` map per field), 409 (slot taken)
and 422 (a booking rule, e.g. less than a week ahead). The wizard sends the visitor to the step that can fix them.

**Reaching the backend:**

- In development, `proxy.conf.json` makes `ng serve` forward `/api` to http://localhost:8080, so `API_URL` stays empty.
- In production, the proxy doesn't exist. Either set `API_URL` at build time, with the site's origin allowed in the
  backend's `CORS_PUBLIC_ORIGINS`, or route `/api` to the backend on the same domain with a reverse proxy.

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
  pages/                         home, about, faq, gallery, contact, location, not-found
  features/booking/              booking page and wizard: data, steps, done screen
  components/                    accordion, gallery, hungary-map, venue-map
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
