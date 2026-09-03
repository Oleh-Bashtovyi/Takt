import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const STORAGE_KEY = 'takt.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly session = signal<Session | null>(readSession());
  private refreshInFlight?: Observable<void>;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  /** Runs during app bootstrap: trade the stored refresh token for a fresh session, or boot as guest. */
  initialize(): Observable<void> {
    if (!this.session()) {
      return of(undefined);
    }
    return this.refresh().pipe(catchError(() => of(undefined)));
  }

  register(payload: RegisterPayload): Observable<void> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.register}`, payload)
      .pipe(
        tap((response) => this.persist(response)),
        map(() => undefined),
      );
  }

  login(payload: LoginPayload): Observable<void> {
    return this.http.post<AuthResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.login}`, payload).pipe(
      tap((response) => this.persist(response)),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    const current = this.session();

    if (!current) {
      return of(undefined);
    }

    return this.http
      .post<void>(`${this.baseUrl}${API_ENDPOINTS.auth.logout}`, {
        refreshToken: current.refreshToken,
      })
      .pipe(
        catchError(() => of(undefined)),
        tap(() => this.clear()),
        map(() => undefined),
      );
  }

  /** Rotates the token pair. Concurrent callers share one request. Clears the session on failure. */
  refresh(): Observable<void> {
    this.refreshInFlight ??= this.requestRefresh().pipe(
      finalize(() => (this.refreshInFlight = undefined)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    return this.refreshInFlight;
  }

  private requestRefresh(): Observable<void> {
    const current = this.session();

    if (!current) {
      return throwError(() => new Error('No active session'));
    }

    return this.http
      .post<AuthResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.refresh}`, {
        refreshToken: current.refreshToken,
      })
      .pipe(
        tap((response) => this.persist(response)),
        map(() => undefined),
        catchError((error: HttpErrorResponse) => {
          // 401 means the refresh token is rejected — log out. Network error or 5xx keeps the session.
          if (error.status === 401) {
            this.clear();
          }
          return throwError(() => error);
        }),
      );
  }

  private persist(response: AuthResponse): void {
    const session: Session = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    };
    this.session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private clear(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
