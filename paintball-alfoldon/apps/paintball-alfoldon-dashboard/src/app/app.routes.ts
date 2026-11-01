import { Route } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.interceptor';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Bejelentkezés · Paintball Alföldön admin',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        title: 'Áttekintés · Paintball Alföldön admin',
        loadComponent: () => import('./pages/overview/overview').then((m) => m.OverviewPage),
      },
      {
        path: 'foglalasok',
        title: 'Foglalások · Paintball Alföldön admin',
        loadComponent: () => import('./pages/bookings/bookings').then((m) => m.BookingsPage),
      },
      {
        path: 'foglalasok/:id',
        title: 'Foglalás · Paintball Alföldön admin',
        loadComponent: () => import('./pages/bookings/bookings').then((m) => m.BookingsPage),
      },
      {
        path: 'naptar',
        title: 'Naptár · Paintball Alföldön admin',
        loadComponent: () => import('./pages/calendar/calendar').then((m) => m.CalendarPage),
      },
      {
        path: 'palyak',
        title: 'Pályák · Paintball Alföldön admin',
        loadComponent: () => import('./pages/venues/venues').then((m) => m.VenuesPage),
      },
      {
        path: 'beosztas',
        title: 'Beosztás · Paintball Alföldön admin',
        loadComponent: () => import('./pages/schedule/schedule').then((m) => m.SchedulePage),
      },
      {
        path: 'alkalmazottak',
        title: 'Alkalmazottak · Paintball Alföldön admin',
        loadComponent: () => import('./pages/employees/employees').then((m) => m.EmployeesPage),
      },
      {
        path: 'eroforrasok',
        title: 'Erőforrások · Paintball Alföldön admin',
        loadComponent: () => import('./pages/resources/resources').then((m) => m.ResourcesPage),
      },
      {
        path: 'beallitasok',
        title: 'Beállítások · Paintball Alföldön admin',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
