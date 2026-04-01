import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResidentCreateDto {
  vards: string;
  uzvards: string;
  personasKods: string;
  telefons: string;
  epasts: string;
  isOwner: boolean;
  dzivoklisIds: string[];
}

export interface ResidentUpdateDto {
  id: string;
  vards: string;
  uzvards: string;
  personasKods: string;
  telefons: string;
  epasts: string;
  isOwner: boolean;
  dzivoklisIds: string[];
}

export interface DzivoklisShort {
  id: string;
  numurs: number;
  majaNosaukums: string;
}

export interface Resident {
  id: string;
  vards: string;
  uzvards: string;
  personasKods?: string;
  telefons?: string;
  epasts?: string;
  isOwner?: boolean;
  dzivokli?: DzivoklisShort[];
}

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private readonly api = 'https://localhost:7187/api/iedzivotajs';

  constructor(private http: HttpClient) {}

  getAllResidents(): Observable<Resident[]> {
    return this.http.get<Resident[]>(this.api);
  }

  create(dto: ResidentCreateDto): Observable<Resident> {
    return this.http.post<Resident>(this.api, dto);
  }

  update(id: string, resident: ResidentUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}`, resident);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getMe(): Observable<Resident> {
    return this.http.get<Resident>(`${this.api}/me`);
  }
}