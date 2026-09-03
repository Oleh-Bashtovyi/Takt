import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/notifications/notification.service';

export interface Category {
  id: string;
  name: string;
  taskCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);
  private readonly baseUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.categories}`;

  readonly categories = httpResource<Category[]>(() => this.baseUrl);

  create(name: string): Observable<void> {
    return this.http.post<Category>(this.baseUrl, { name }).pipe(
      tap(() => this.categories.reload()),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => this.fail(error, 'Could not create the list.')),
    );
  }

  rename(id: string, name: string): Observable<void> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, { name }).pipe(
      tap(() => this.categories.reload()),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => this.fail(error, 'Could not rename the list.')),
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.categories.reload()),
      catchError((error: HttpErrorResponse) => this.fail(error, 'Could not delete the list.')),
    );
  }

  private fail(error: HttpErrorResponse, fallback: string): Observable<never> {
    this.notifications.error(
      error.status === 409 ? 'A list with that name already exists.' : fallback,
    );
    return throwError(() => error);
  }
}
