import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/site/pages/home/home').then(m => m.Home)
  },
  {
    path: 'rolunk',
    loadComponent: () => import('./features/site/pages/about/about').then(m => m.About)
  },
  {
    path: 'gyik',
    loadComponent: () => import('./features/site/pages/faq/faq').then(m => m.Faq)
  },
  {
    path: 'galeria',
    loadComponent: () => import('./features/site/pages/gallery-page/gallery-page').then(m => m.GalleryPage)
  },
  {
    path: 'foglalas',
    loadChildren: () => import('./features/booking/booking.routes').then(m => m.BOOKING_ROUTES)
  },
  {
    path: 'kapcsolat',
    loadComponent: () => import('./features/site/pages/contact/contact').then(m => m.Contact)
  },
  
  // Reusable Location pages mapped with custom data ID
  {
    path: 'szeged',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'szeged' }
  },
  {
    path: 'szeged-csarnok',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'szeged-csarnok' }
  },
  {
    path: 'szentes',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'szentes' }
  },
  {
    path: 'szolnok',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'szolnok' }
  },
  {
    path: 'kecskemet',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'kecskemet' }
  },
  {
    path: 'bekescsaba',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'bekescsaba' }
  },
  {
    path: 'oroshaza',
    loadComponent: () => import('./features/venues/pages/location/location').then(m => m.LocationPage),
    data: { id: 'oroshaza' }
  },

  // Fallback
  {
    path: '**',
    loadComponent: () => import('./features/site/pages/not-found/not-found').then(m => m.NotFound)
  }
];

