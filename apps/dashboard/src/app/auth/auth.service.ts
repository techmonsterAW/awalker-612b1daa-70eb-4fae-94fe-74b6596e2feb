import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserView } from '@taskmgmt/data';

const TOKEN_KEY = 'task_token';
const USER_KEY = 'task_user';
const API = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserView | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): UserView | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, dto).pipe(
      tap((res) => {
        sessionStorage.setItem(TOKEN_KEY, res.accessToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): UserView | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserView;
    } catch {
      return null;
    }
  }
}
