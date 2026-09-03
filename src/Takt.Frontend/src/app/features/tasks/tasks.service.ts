import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/notifications/notification.service';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDateUtc: string | null;
  categoryId: string | null;
  categoryName: string | null;
  completedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PagedTasks {
  items: Task[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);
  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.tasks}`;
  private readonly pending = new Set<string>();

  readonly tasks = httpResource<PagedTasks>(() => ({
    url: this.baseUrl,
    params: { sortBy: 'Priority', sortDescending: true },
  }));

  create(title: string): Observable<Task> {
    return this.http
      .post<Task>(this.baseUrl, {
        title,
        description: null,
        priority: null,
        dueDateUtc: null,
        categoryId: null,
      })
      .pipe(tap(() => this.tasks.reload()));
  }

  setCompleted(id: string, isCompleted: boolean): void {
    if (this.pending.has(id)) {
      return;
    }
    this.pending.add(id);
    this.applyLocal(id, {
      isCompleted,
      completedAtUtc: isCompleted ? new Date().toISOString() : null,
    });

    this.http.patch<Task>(`${this.baseUrl}/${id}/completion`, { isCompleted }).subscribe({
      next: (updated) => {
        this.pending.delete(id);
        this.applyLocal(id, {
          isCompleted: updated.isCompleted,
          completedAtUtc: updated.completedAtUtc,
        });
      },
      error: () => {
        this.pending.delete(id);
        this.applyLocal(id, {
          isCompleted: !isCompleted,
          completedAtUtc: !isCompleted ? new Date().toISOString() : null,
        });
        this.notifications.error('Could not update the task.');
      },
    });
  }

  private applyLocal(id: string, patch: Partial<Task>): void {
    this.tasks.update((page) =>
      page
        ? {
            ...page,
            items: page.items.map((task) => (task.id === id ? { ...task, ...patch } : task)),
          }
        : page,
    );
  }
}
