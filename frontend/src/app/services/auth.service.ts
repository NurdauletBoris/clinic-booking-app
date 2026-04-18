import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface AuthUser {
  username: string;
  email: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY    = 'cb_jwt_token';
  private readonly USER_KEY     = 'cb_auth_user';
  private readonly USERS_DB_KEY = 'cb_users_db';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  private get mockDb(): RegisterRequest[] {
    try {
      const raw = localStorage.getItem(this.USERS_DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }

    const seed: RegisterRequest[] = [
      { username: 'Daniyar', email: 'daniyar@example.com', password: 'password123' },
      { username: 'Aizat',   email: 'aizat@example.com',   password: 'password123' },
      { username: 'Nurzhan', email: 'nurzhan@example.com', password: 'password123' },
    ];
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(seed));
    return seed;
  }

  private saveMockDb(users: RegisterRequest[]) {
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(users));
  }

  login(payload: LoginRequest): AuthResult {
    const found = this.mockDb.find(
      u => u.email === payload.email && u.password === payload.password
    );
    if (!found) return { success: false, error: 'Неверный email или пароль' };

    const token = this.buildMockJwt(found.email, found.username);
    this.persistSession({ username: found.username, email: found.email, token }, token);
    return { success: true };
  }

  loginViaApi(payload: LoginRequest): Observable<AuthResult> {
    return this.http.post<{ token: string; user: AuthUser }>('/api/auth/login', payload).pipe(
      tap(res => this.persistSession(res.user, res.token)),
      map(() => ({ success: true } as AuthResult)),
      catchError(err => {
        const error = err.error?.message || 'Неверный email или пароль';
        return of({ success: false, error } as AuthResult);
      })
    );
  }

  register(payload: RegisterRequest): AuthResult {
    const users = this.mockDb;

    if (users.find(u => u.email === payload.email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }

    this.saveMockDb([...users, payload]);

    const token = this.buildMockJwt(payload.email, payload.username);
    this.persistSession({ username: payload.username, email: payload.email, token }, token);
    return { success: true };
  }

  registerViaApi(payload: RegisterRequest): Observable<AuthResult> {
    return this.http.post<{ token: string; user: AuthUser }>('/api/auth/register', payload).pipe(
      tap(res => this.persistSession(res.user, res.token)),
      map(() => ({ success: true } as AuthResult)),
      catchError(err => {
        const error = err.error?.message || 'Ошибка регистрации. Попробуйте позже.';
        return of({ success: false, error } as AuthResult);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private persistSession(user: AuthUser, token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private buildMockJwt(email: string, username: string): string {
    const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: email,
      name: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    return `${header}.${btoa('mock-sig')}.${payload}`;
  }
}