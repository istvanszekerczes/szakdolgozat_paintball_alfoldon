import { Routes } from '@angular/router';

/** `/foglalas`; `?palya=<slug>` preselects a venue in the wizard. */
export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./booking-page').then((m) => m.BookingPage),
  },
];
