import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

type JwtPayload = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = 'https://localhost:7187/api/auth';

  private readonly roleClaim =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  private readonly nameClaim =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, { email, password })
      .pipe(
        tap((res: LoginResponse) => {
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

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      let payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      while (payload.length % 4 !== 0) {
        payload += '=';
      }

      const decoded = atob(payload);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    return token ? this.decodeJwtPayload(token) : null;
  }

  private toStringValue(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (value != null) {
      return String(value);
    }

    return null;
  }

  private getClaimValue(...keys: string[]): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    for (const key of keys) {
      const value = payload[key];

      if (Array.isArray(value) && value.length > 0) {
        const first = this.toStringValue(value[0]);
        if (first) return first;
      }

      const stringValue = this.toStringValue(value);
      if (stringValue) return stringValue;
    }

    return null;
  }

  getRole(): string | null {
    return this.getClaimValue(this.roleClaim, 'role', 'roles');
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
    return this.getClaimValue('email', 'unique_name', this.nameClaim);
  }

  getUserId(): string | null {
    return this.getClaimValue('UserId', 'userId', 'sub');
  }

  getResidentId(): string | null {
    return this.getClaimValue('IedzivotajsId', 'iedzivotajsId', 'residentId');
  }

  getApartmentId(): string | null {
    return this.getClaimValue('DzivoklisId', 'dzivoklisId', 'apartmentId');
  }

  getHouseId(): string | null {
    return this.getClaimValue('MajaId', 'majaId', 'houseId');
  }
}