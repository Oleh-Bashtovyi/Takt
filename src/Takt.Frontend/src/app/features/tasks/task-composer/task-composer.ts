import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TASK } from '../../../constants/validation.constants';
import { NotificationService } from '../../../core/notifications/notification.service';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-task-composer',
  imports: [ReactiveFormsModule],
  templateUrl: './task-composer.html',
})
export class TaskComposer {
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly notifications = inject(NotificationService);

  protected readonly limits = TASK;
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
  });

  protected submit(): void {
    const title = this.form.controls.title.value.slice(0, this.limits.titleMax).trim();
    if (!title || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.tasksService.create(title).subscribe({
      next: () => {
        this.form.reset();
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
        this.notifications.error('Could not create the task.');
      },
    });
  }
}
