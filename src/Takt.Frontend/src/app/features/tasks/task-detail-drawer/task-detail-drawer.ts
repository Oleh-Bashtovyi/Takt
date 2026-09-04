import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TASK } from '../../../constants/validation.constants';
import { Icon } from '../../../shared/components/icon/icon';
import { CategoriesService } from '../../categories/categories.service';
import { Task, TaskPriority, TasksService } from '../tasks.service';

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

@Component({
  selector: 'app-task-detail-drawer',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './task-detail-drawer.html',
  styleUrl: './task-detail-drawer.css',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class TaskDetailDrawer {
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly categoriesService = inject(CategoriesService);

  readonly task = input.required<Task>();
  readonly closed = output<void>();

  protected readonly priorities = PRIORITIES;
  protected readonly limits = TASK;
  protected readonly saving = signal(false);
  protected readonly confirmingDelete = signal(false);

  protected readonly categories = computed(() =>
    this.categoriesService.categories.hasValue() ? this.categoriesService.categories.value() : [],
  );

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    priority: ['Medium' as TaskPriority],
    dueDate: [''],
    categoryId: [''],
  });

  constructor() {
    effect(() => {
      const task = this.task();
      this.form.reset({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: task.dueDateUtc ? task.dueDateUtc.slice(0, 10) : '',
        categoryId: task.categoryId ?? '',
      });
      this.confirmingDelete.set(false);
    });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.tasksService
      .update(this.task().id, {
        title: value.title.slice(0, this.limits.titleMax).trim(),
        description: value.description.slice(0, this.limits.descriptionMax).trim() || null,
        priority: value.priority,
        dueDateUtc: value.dueDate ? `${value.dueDate}T00:00:00.000Z` : null,
        categoryId: value.categoryId || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closed.emit();
        },
        error: () => this.saving.set(false),
      });
  }

  protected remove(): void {
    this.tasksService.remove(this.task().id).subscribe({
      next: () => this.closed.emit(),
      error: () => this.confirmingDelete.set(false),
    });
  }
}
