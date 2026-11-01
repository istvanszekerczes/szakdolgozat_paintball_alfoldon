import { RenderMode, ServerRoute } from '@angular/ssr';

// The admin is behind a login and reads its token from localStorage, so it renders in the browser only.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
