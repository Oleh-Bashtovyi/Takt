import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CategoriesService } from '../categories.service';

@Component({
  selector: 'app-category-sidebar',
  imports: [RouterLink],
  templateUrl: './category-sidebar.html',
  host: { class: 'flex w-56 shrink-0' },
})
export class CategorySidebar {
  protected readonly categories = inject(CategoriesService).categories;

  protected readonly activeCategoryId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('categoryId'))),
    { initialValue: null },
  );
}
