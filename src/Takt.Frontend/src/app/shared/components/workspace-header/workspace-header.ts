import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AuthService } from '../../../core/auth/auth.service';
import { CategoriesService } from '../../../features/categories/categories.service';
import { LogoGroup } from '../logo-group/logo-group';

@Component({
  selector: 'app-workspace-header',
  imports: [RouterLink, LogoGroup],
  templateUrl: './workspace-header.html',
})
export class WorkspaceHeader {
  private readonly router = inject(Router);
  private readonly categories = inject(CategoriesService).categories;

  protected readonly routes = APP_ROUTES;
  protected readonly user = inject(AuthService).user;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly categoryId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('categoryId'))),
    { initialValue: null },
  );

  protected readonly onProfile = computed(() => this.url().startsWith(APP_ROUTES.profile));

  protected readonly categoryName = computed(() => {
    const id = this.categoryId();
    if (!id || !this.categories.hasValue()) {
      return null;
    }
    return this.categories.value().find((category) => category.id === id)?.name ?? null;
  });

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
