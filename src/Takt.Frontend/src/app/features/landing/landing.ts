import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../constants/routes.constants';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Header],
  templateUrl: './landing.html',
})
export class Landing {
  protected readonly routes = APP_ROUTES;
}
