import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Observable, map, tap } from 'rxjs';
import { computed } from '@angular/core';
import { BackendCommunicator } from '../services/backend-communicator';
import { Session } from '../../features/auth/models/auth';

const STORAGE_KEY = 'pa-admin-session';

type AuthState = {
  session: Session | null;
};

const initialState: AuthState = {
  session: null,
};

/** Holds the admin JWT. It goes in the Authorization header, never in a cookie (see SecurityConfig). */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('auth'),
  withComputed((store) => ({
    username: computed(() => store.session()?.username ?? null),
  })),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
    browser: isPlatformBrowser(inject(PLATFORM_ID)),
  })),
  withMethods(({ backendCommunicator, browser, ...store }) => ({
    login(username: string, password: string): Observable<Session> {
      return backendCommunicator.login({ username, password }).pipe(
        map((res) => ({ token: res.token, expiresAt: res.expiresAt, username })),
        tap((session) => {
          patchState(store, { session });
          if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }),
      );
    },

    changePassword(currentPassword: string, newPassword: string): Observable<void> {
      return backendCommunicator.changePassword(currentPassword, newPassword);
    },

    clearSession() {
      patchState(store, { session: null });
      if (browser) localStorage.removeItem(STORAGE_KEY);
    },

    restoreSession() {
      if (!browser) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        patchState(store, { session: raw ? (JSON.parse(raw) as Session) : null });
      } catch {
        patchState(store, { session: null });
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.restoreSession();
    },
  }),
);
