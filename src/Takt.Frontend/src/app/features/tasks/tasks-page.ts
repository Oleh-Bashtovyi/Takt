import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs';
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
})
export class TasksPage {
  protected readonly tasksService = inject(TasksService);
  protected readonly tasks = this.tasksService.tasks;
  protected readonly sortFields = SORT_FIELDS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => this.tasksService.categoryId.set(params.get('categoryId')));

    this.searchControl.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe((value) => this.tasksService.search.set(value.trim()));
  }

  protected readonly showCompleted = signal(true);
  protected readonly selectedId = signal<string | null>(null);

  protected readonly items = computed(() => this.tasks.value()?.items ?? []);
  protected readonly selectedTask = computed(
    () => this.items().find((task) => task.id === this.selectedId()) ?? null,
  );
  protected readonly activeTasks = computed(() => this.items().filter((task) => !task.isCompleted));
  protected readonly completedTasks = computed(() =>
    this.items().filter((task) => task.isCompleted),
  );

  protected setSortField(value: string): void {
    this.tasksService.sortBy.set(value as TaskSortField);
  }

  protected toggleSortDirection(): void {
    this.tasksService.sortDescending.update((descending) => !descending);
  }
}
