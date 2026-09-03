import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../shared/components/icon/icon';
import { Task, TaskPriority } from '../tasks.service';

const PRIORITY_ACCENT: Record<TaskPriority, string> = {
  High: 'border-l-red-500',
  Medium: 'border-l-amber-500',
  Low: 'border-l-green-500',
};

@Component({
  selector: 'app-task-row',
  imports: [DatePipe, Icon],
  templateUrl: './task-row.html',
})
export class TaskRow {
  readonly task = input.required<Task>();
  readonly toggleCompleted = output<boolean>();

  protected readonly accent = PRIORITY_ACCENT;

  protected readonly overdue = computed(() => {
    const task = this.task();
    return !task.isCompleted && task.dueDateUtc !== null && new Date(task.dueDateUtc) < new Date();
  });
}
