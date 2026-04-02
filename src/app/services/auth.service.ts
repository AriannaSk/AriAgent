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
  private api = 'https://localhost:7187/api/auth';

  private readonly roleClaim =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly nameClaim =
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, { email, password })
      .pipe(
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

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      let payload = parts[1];

      payload = payload.replace(/-/g, '+').replace(/_/g, '/');

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
    if (!token) return null;
    return this.decodeJwtPayload(token);
  }

  getRole(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    const directRole = payload[this.roleClaim];
    if (typeof directRole === 'string' && directRole.trim()) {
      return directRole;
    }

    const role = payload['role'];
    if (typeof role === 'string' && role.trim()) {
      return role;
    }

    const roles = payload['roles'];
    if (typeof roles === 'string' && roles.trim()) {
      return roles;
    }

    if (Array.isArray(roles) && roles.length > 0) {
      const first = roles[0];
      return typeof first === 'string' ? first : null;
    }

    return null;
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
    if (!payload) return null;

    const email =
      payload['email'] ??
      payload['unique_name'] ??
      payload[this.nameClaim];

    return typeof email === 'string' ? email : null;
  }

  getUserId(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    const userId =
      payload['UserId'] ??
      payload['userId'] ??
      payload['sub'];

    return typeof userId === 'string' ? userId : userId != null ? String(userId) : null;
  }

  getResidentId(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    const residentId =
      payload['IedzivotajsId'] ??
      payload['iedzivotajsId'] ??
      payload['residentId'];

    return typeof residentId === 'string'
      ? residentId
      : residentId != null
        ? String(residentId)
        : null;
  }

  getApartmentId(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    const apartmentId =
      payload['DzivoklisId'] ??
      payload['dzivoklisId'] ??
      payload['apartmentId'];

    return typeof apartmentId === 'string'
      ? apartmentId
      : apartmentId != null
        ? String(apartmentId)
        : null;
  }

  getHouseId(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;

    const houseId =
      payload['MajaId'] ??
      payload['majaId'] ??
      payload['houseId'];

    return typeof houseId === 'string'
      ? houseId
      : houseId != null
        ? String(houseId)
        : null;
  }
}