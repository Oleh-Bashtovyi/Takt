import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_ROUTES } from '../../constants/routes.constants';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).isAuthenticated() || router.parseUrl(APP_ROUTES.login);
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return !inject(AuthService).isAuthenticated() || router.parseUrl(APP_ROUTES.tasks);
};
