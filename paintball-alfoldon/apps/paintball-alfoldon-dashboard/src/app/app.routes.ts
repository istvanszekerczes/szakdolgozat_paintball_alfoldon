import { Route } from '@angular/router';
import { authGuard, guestGuard } from './core/interceptors/auth-interceptor';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Bejelentkezés · Paintball Alföldön admin',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        title: 'Áttekintés · Paintball Alföldön admin',
        loadComponent: () => import('./features/overview/pages/overview/overview').then((m) => m.Overview),
      },
      {
        path: 'foglalasok',
        title: 'Foglalások · Paintball Alföldön admin',
        loadComponent: () => import('./features/bookings/pages/bookings/bookings').then((m) => m.Bookings),
      },
      {
        path: 'foglalasok/:id',
        title: 'Foglalás · Paintball Alföldön admin',
        loadComponent: () => import('./features/bookings/pages/bookings/bookings').then((m) => m.Bookings),
      },
      {
        path: 'naptar',
        title: 'Naptár · Paintball Alföldön admin',
        loadComponent: () => import('./features/bookings/pages/calendar/calendar').then((m) => m.Calendar),
      },
      {
        path: 'palyak',
        title: 'Pályák · Paintball Alföldön admin',
        loadComponent: () => import('./features/venues/pages/venues/venues').then((m) => m.Venues),
      },
      {
        path: 'beosztas',
        title: 'Beosztás · Paintball Alföldön admin',
        loadComponent: () => import('./features/schedule/pages/schedule/schedule').then((m) => m.Schedule),
      },
      {
        path: 'alkalmazottak',
        title: 'Alkalmazottak · Paintball Alföldön admin',
        loadComponent: () => import('./features/employees/pages/employees/employees').then((m) => m.Employees),
      },
      {
        path: 'eroforrasok',
        title: 'Erőforrások · Paintball Alföldön admin',
        loadComponent: () => import('./features/resources/pages/resources/resources').then((m) => m.Resources),
      },
      {
        path: 'beallitasok',
        title: 'Beállítások · Paintball Alföldön admin',
        loadComponent: () => import('./features/auth/pages/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
