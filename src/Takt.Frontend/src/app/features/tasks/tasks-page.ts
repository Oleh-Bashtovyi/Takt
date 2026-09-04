import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { SEARCH_DEBOUNCE_MS } from '../../constants/ui.constants';
import { Icon } from '../../shared/components/icon/icon';
import { CategorySidebar } from '../categories/category-sidebar/category-sidebar';
import { TaskComposer } from './task-composer/task-composer';
import { TaskDetailDrawer } from './task-detail-drawer/task-detail-drawer';
import { TaskRow } from './task-row/task-row';
import { TaskSortField, TasksService } from './tasks.service';

const SORT_FIELDS: { value: TaskSortField; label: string }[] = [
  { value: 'Priority', label: 'Priority' },
  { value: 'DueDate', label: 'Due date' },
  { value: 'Title', label: 'Title' },
  { value: 'CreatedAt', label: 'Date added' },
];

@Component({
  selector: 'app-tasks-page',
  imports: [CategorySidebar, TaskComposer, TaskDetailDrawer, TaskRow, Icon, ReactiveFormsModule],
  templateUrl: './tasks-page.html',
  host: { class: 'flex min-w-0 flex-1' },
})
export class TasksPage {
  private readonly router = inject(Router);
  protected readonly tasksService = inject(TasksService);
  protected readonly tasks = this.tasksService.tasks;
  protected readonly sortFields = SORT_FIELDS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => {
        this.tasksService.categoryId.set(params.get('categoryId'));
        this.tasksService.completed.set(params.get('tab') === 'completed');
        const page = Number(params.get('page'));
        this.tasksService.page.set(Number.isInteger(page) && page > 1 ? page : 1);
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe((value) => {
        this.tasksService.search.set(value.trim());
        this.resetPage();
      });
  }

  protected readonly selectedId = signal<string | null>(null);

  protected readonly items = computed(() => this.tasks.value()?.items ?? []);
  protected readonly selectedTask = computed(
    () => this.items().find((task) => task.id === this.selectedId()) ?? null,
  );

  protected readonly totalPages = computed(() => this.tasks.value()?.totalPages ?? 1);

  protected readonly pageNumbers = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.tasksService.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages: (number | '…')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) {
      pages.push('…');
    }
    for (let page = start; page <= end; page++) {
      pages.push(page);
    }
    if (end < total - 1) {
      pages.push('…');
    }
    pages.push(total);
    return pages;
  });

  protected setTab(completed: boolean): void {
    this.router.navigate([], {
      queryParams: { tab: completed ? 'completed' : null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number | '…'): void {
    if (page === '…' || page < 1 || page > this.totalPages() || page === this.tasksService.page()) {
      return;
    }
    this.router.navigate([], {
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected setSortField(value: string): void {
    this.tasksService.sortBy.set(value as TaskSortField);
    this.resetPage();
  }

  protected toggleSortDirection(): void {
    this.tasksService.sortDescending.update((descending) => !descending);
    this.resetPage();
  }

  private resetPage(): void {
    if (this.tasksService.page() !== 1) {
      this.router.navigate([], { queryParams: { page: null }, queryParamsHandling: 'merge' });
    }
  }
}
