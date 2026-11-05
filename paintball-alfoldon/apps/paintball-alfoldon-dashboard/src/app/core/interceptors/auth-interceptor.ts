import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { SKIPS_AUTH } from './skips-auth';

/**
 * Adds the admin token to API calls and sends the user back to login when it is rejected.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const skipsAuth = req.context.get(SKIPS_AUTH);
  const token = authService.token();
  const request =
    token && !skipsAuth ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !skipsAuth) authService.logout();
      return throwError(() => err);
    }),
  );
};
