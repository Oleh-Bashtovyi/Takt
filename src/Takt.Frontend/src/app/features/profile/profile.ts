import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../constants/routes.constants';
import { AuthService } from '../../core/auth/auth.service';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-profile',
  imports: [Header],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl(APP_ROUTES.landing));
  }
}
