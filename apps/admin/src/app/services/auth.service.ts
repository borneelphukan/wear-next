import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import type { LoginRequest, AdminRole } from '../models/admin.models';

interface LoginResponse {
  user: { id: number; firstName: string; lastName: string; email: string; role: AdminRole; darkMode: boolean };
  accessToken: string;
}

interface AuthState {
  token: string;
  user: { id: number; firstName: string; lastName: string; email: string; role: AdminRole; darkMode: boolean };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'admin_session';
  private apiBase = 'http://localhost:4000';

  state = signal<AuthState | null>(this.loadSession());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(body: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.apiBase}/admin/auth/login`, body)
      .pipe(
        tap((res) => {
          const state: AuthState = { token: res.accessToken, user: res.user };
          localStorage.setItem(this.storageKey, JSON.stringify(state));
          this.state.set(state);
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.state.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.state() !== null;
  }

  isCEO(): boolean {
    return this.state()?.user?.role === 'CEO';
  }

  updateState(user: AuthState['user']) {
    const current = this.state();
    if (!current) return;
    const updated: AuthState = { ...current, user };
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    this.state.set(updated);
  }

  private loadSession(): AuthState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  }
}
