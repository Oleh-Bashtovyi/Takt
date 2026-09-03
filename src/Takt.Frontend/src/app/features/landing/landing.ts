import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../constants/routes.constants';
import { AuthService } from '../../core/auth/auth.service';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Header],
  templateUrl: './landing.html',
})
export class Landing {
  protected readonly routes = APP_ROUTES;
  protected readonly isAuthenticated = inject(AuthService).isAuthenticated;
}
