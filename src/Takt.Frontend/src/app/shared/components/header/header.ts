import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { LogoGroup } from '../logo-group/logo-group';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LogoGroup],
  templateUrl: './header.html',
})
export class Header {
  protected readonly routes = APP_ROUTES;
  protected readonly user = inject(AuthService).user;
}
