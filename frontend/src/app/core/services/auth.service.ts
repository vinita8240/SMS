import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User } from '../models/models';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notify = inject(NotificationService);

  private readonly TOKEN_KEY = 'sms_auth_token';
  private readonly REFRESH_KEY = 'sms_refresh_token';
  private readonly USER_KEY = 'sms_auth_user';

  // Signals for Auth State
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor() {
    if (this.token()) {
      this.fetchProfile().subscribe();
    }
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(credentials: { email?: string; username?: string; password: string; role?: string }): Observable<ApiResponse> {
    const payload = {
      username: credentials.username || credentials.email,
      email: credentials.email || credentials.username,
      password: credentials.password,
      role: credentials.role
    };
    return this.http.post<ApiResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          const { user, token, refreshToken } = res.data;
          this.setSession(user, token, refreshToken);
          this.notify.success('Welcome back!', `Logged in as ${user.name}`);
          this.redirectByRole(user.role);
        }
      })
    );
  }

  fetchProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      }),
      catchError(err => {
        if (err.status === 401) {
          this.logout();
        }
        return of(err);
      })
    );
  }

  changePassword(passwords: { currentPassword: string; newPassword: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/auth/change-password`, passwords);
  }

  private setSession(user: User, token: string, refreshToken: string) {
    const normalizedUser: User = {
      ...user,
      id: user.id || (user as any).admin_id || (user as any).teacher_id || (user as any).parent_id || (user as any).student_id || 1,
      name: user.name || (user as any).first_name || 'Administrator',
      role: user.role || 'super_admin',
      userType: user.userType || 'admin'
    };
    this.currentUser.set(normalizedUser);
    this.token.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
  }

  logout() {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  redirectByRole(role?: string) {
    this.router.navigate(['/dashboard']);
  }

  hasRole(...roles: string[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    if (current === 'super_admin') return true;
    return roles.map(r => r.toLowerCase()).includes(current.toLowerCase());
  }
}
