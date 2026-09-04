import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/notifications/notification.service';
import { CategoriesService } from '../categories/categories.service';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskSortField = 'CreatedAt' | 'DueDate' | 'Priority' | 'Title';

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

export interface TaskEdit {
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDateUtc: string | null;
  categoryId: string | null;
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
  private readonly categoriesService = inject(CategoriesService);
  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.tasks}`;
  private readonly pending = new Set<string>();

  readonly categoryId = signal<string | null>(null);
  readonly search = signal('');
  readonly sortBy = signal<TaskSortField>('Priority');
  readonly sortDescending = signal(true);

  readonly tasks = httpResource<PagedTasks>(() => {
    const params: Record<string, string | boolean> = {
      sortBy: this.sortBy(),
      sortDescending: this.sortDescending(),
    };
    const search = this.search().trim();
    if (search) {
      params['search'] = search;
    }
    const categoryId = this.categoryId();
    if (categoryId) {
      params['categoryId'] = categoryId;
    }
    return { url: this.baseUrl, params };
  });

  create(title: string): Observable<Task> {
    return this.http
      .post<Task>(this.baseUrl, {
        title,
        description: null,
        priority: null,
        dueDateUtc: null,
        categoryId: this.categoryId(),
      })
      .pipe(
        tap(() => {
          this.tasks.reload();
          this.categoriesService.categories.reload();
        }),
      );
  }

  update(id: string, edit: TaskEdit): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, edit).pipe(
      tap((updated) => {
        this.applyLocal(id, updated);
        this.categoriesService.categories.reload();
      }),
      catchError((error: HttpErrorResponse) => {
        this.notifications.error('Could not save the task.');
        return throwError(() => error);
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.tasks.update((page) =>
          page ? { ...page, items: page.items.filter((task) => task.id !== id) } : page,
        );
        this.categoriesService.categories.reload();
      }),
      catchError((error: HttpErrorResponse) => {
        this.notifications.error('Could not delete the task.');
        return throwError(() => error);
      }),
    );
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
