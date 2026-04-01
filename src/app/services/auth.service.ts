import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'https://localhost:7187/api/auth';

  private readonly roleClaim =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  private readonly nameClaim =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getPayload(): Record<string, any> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const payload = this.getPayload();
    return payload ? payload[this.roleClaim] ?? null : null;
  }

  hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  isManager(): boolean {
    return this.hasRole('Manager');
  }

  isResident(): boolean {
    return this.hasRole('Resident');
  }

  getUserEmail(): string | null {
    const payload = this.getPayload();

    if (!payload) {
      return null;
    }

    return (
      payload['email'] ??
      payload['unique_name'] ??
      payload[this.nameClaim] ??
      null
    );
  }

  getUserId(): string | null {
    const payload = this.getPayload();

    if (!payload) {
      return null;
    }

    return payload['UserId'] ?? null;
  }

  getResidentId(): string | null {
    const payload = this.getPayload();

    if (!payload) {
      return null;
    }

    return payload['IedzivotajsId'] ?? null;
  }
}