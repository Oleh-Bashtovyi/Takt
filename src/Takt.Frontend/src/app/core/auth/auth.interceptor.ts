import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { APP_ROUTES } from '../../constants/routes.constants';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const RETRIED = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(withBearer(req, auth.accessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      const canRetry =
        error.status === 401 &&
        !req.context.get(RETRIED) &&
        !req.url.includes('/auth/') &&
        auth.isAuthenticated();

      if (!canRetry) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() =>
          next(
            withBearer(req.clone({ context: req.context.set(RETRIED, true) }), auth.accessToken()),
          ),
        ),
        catchError(() => {
          if (!auth.isAuthenticated()) {
            router.navigateByUrl(APP_ROUTES.login);
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};

function withBearer(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
