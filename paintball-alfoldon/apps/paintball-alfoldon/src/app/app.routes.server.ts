import { RenderMode, ServerRoute } from '@angular/ssr';

const PRERENDERED_PATHS = [
  '',
  'rolunk',
  'gyik',
  'galeria',
  'foglalas',
  'kapcsolat',
  'szeged',
  'szeged-csarnok',
  'szentes',
  'szolnok',
  'kecskemet',
  'bekescsaba',
  'oroshaza',
];

export const serverRoutes: ServerRoute[] = [
  ...PRERENDERED_PATHS.map((path): ServerRoute => ({ path, renderMode: RenderMode.Prerender })),
  // Anything else is an unknown URL: rendered per request, so it can answer with a real 404.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
