import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      // MapLibre's worker + shared chunk are copied with un-hashed names (see angular.json
      // assets), so they must revalidate instead of living in the cache for a year.
      if (/maplibre-gl-(worker|shared)\.mjs$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, no-cache');
      }
    },
  }),
);

/**
 * Anything that looks like a file (has an extension) but was not found above is a real
 * 404 — never hand it to the Angular renderer.
 */
app.use((req, res, next) => {
  if (/\.[a-z0-9]{1,8}$/i.test(req.path)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
