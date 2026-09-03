import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { Icon } from '../../../shared/components/icon/icon';
import { Category, CategoriesService } from '../categories.service';

@Component({
  selector: 'app-category-sidebar',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './category-sidebar.html',
  host: { class: 'flex w-56 shrink-0' },
})
export class CategorySidebar {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);

  protected readonly routes = APP_ROUTES;
  protected readonly categories = this.categoriesService.categories;

  protected readonly activeCategoryId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('categoryId'))),
    { initialValue: null },
  );

  protected readonly editingId = signal<string | null>(null);
  protected readonly confirmingId = signal<string | null>(null);
  protected readonly addControl = new FormControl('', { nonNullable: true });
  protected readonly editControl = new FormControl('', { nonNullable: true });

  protected add(): void {
    const name = this.addControl.value.trim();
    if (!name) {
      return;
    }
    this.categoriesService.create(name).subscribe({
      next: () => this.addControl.reset(),
      error: () => undefined,
    });
  }

  protected startEdit(category: Category): void {
    this.confirmingId.set(null);
    this.editControl.setValue(category.name);
    this.editingId.set(category.id);
  }

  protected saveEdit(category: Category): void {
    if (this.editingId() !== category.id) {
      return;
    }
    const name = this.editControl.value.trim();
    if (!name || name === category.name) {
      this.editingId.set(null);
      return;
    }
    this.categoriesService.rename(category.id, name).subscribe({
      next: () => this.editingId.set(null),
      error: () => undefined,
    });
  }

  protected askDelete(category: Category): void {
    this.editingId.set(null);
    this.confirmingId.set(category.id);
  }

  protected confirmDelete(category: Category): void {
    this.categoriesService.remove(category.id).subscribe({
      next: () => {
        this.confirmingId.set(null);
        if (this.activeCategoryId() === category.id) {
          this.router.navigate([APP_ROUTES.tasks]);
        }
      },
      error: () => this.confirmingId.set(null),
    });
  }
}
