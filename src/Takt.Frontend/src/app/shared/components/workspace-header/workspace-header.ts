import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { LogoGroup } from '../logo-group/logo-group';

@Component({
  selector: 'app-workspace-header',
  imports: [RouterLink, LogoGroup],
  templateUrl: './workspace-header.html',
})
export class WorkspaceHeader {
  protected readonly routes = APP_ROUTES;
  protected readonly user = inject(AuthService).user;

  protected readonly initials = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }

    const name = user.displayName?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      const value = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
      return value.toUpperCase();
    }

    return user.email.slice(0, 2).toUpperCase();
  });
}
