import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../constants/routes.constants';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  host: { class: 'min-w-0 flex-1 overflow-y-auto' },
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl(APP_ROUTES.landing));
  }
}
