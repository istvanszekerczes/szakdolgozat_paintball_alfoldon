import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'rolunk',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'gyik',
    loadComponent: () => import('./pages/faq/faq-page.component').then(m => m.FaqPageComponent)
  },
  {
    path: 'galeria',
    loadComponent: () => import('./pages/gallery-page/gallery-page.component').then(m => m.GalleryPageComponent)
  },
  {
    path: 'foglalas',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'kapcsolat',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  
  // Reusable Location pages mapped with custom data ID
  {
    path: 'szeged',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'szeged' }
  },
  {
    path: 'szeged-csarnok',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'szeged-csarnok' }
  },
  {
    path: 'szentes',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'szentes' }
  },
  {
    path: 'szolnok',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'szolnok' }
  },
  {
    path: 'kecskemet',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'kecskemet' }
  },
  {
    path: 'bekescsaba',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'bekescsaba' }
  },
  {
    path: 'oroshaza',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent),
    data: { id: 'oroshaza' }
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];

