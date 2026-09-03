import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
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

  readonly user = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((response) => this.persist(response)),
      map(() => undefined),
    );
  }

  login(payload: LoginPayload): Observable<void> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
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
      .post<void>(`${this.baseUrl}/auth/logout`, { refreshToken: current.refreshToken })
      .pipe(
        catchError(() => of(undefined)),
        tap(() => this.clear()),
        map(() => undefined),
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
