import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../shared/components/icon/icon';
import { TaskComposer } from './task-composer/task-composer';
import { TaskRow } from './task-row/task-row';
import { TasksService } from './tasks.service';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskComposer, TaskRow, Icon],
  templateUrl: './tasks-page.html',
})
export class TasksPage {
  protected readonly tasksService = inject(TasksService);
  protected readonly tasks = this.tasksService.tasks;

  protected readonly showCompleted = signal(true);

  protected readonly items = computed(() => this.tasks.value()?.items ?? []);
  protected readonly activeTasks = computed(() => this.items().filter((task) => !task.isCompleted));
  protected readonly completedTasks = computed(() =>
    this.items().filter((task) => task.isCompleted),
  );
}
