import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceReading {
  id: string;
  apartmentId: string;
  residentId: string;
  serviceId: string;
  serviceName: string;
  period: string;
  previousValue: number;
  currentValue: number;
  usage: number;
  submittedAt: string;
}

export interface ServiceReadingCreateDto {
  apartmentId: string;
  serviceId: string;
  period: string;
  previousValue: number;
  currentValue: number;
}

export interface ServiceReadingUpdateDto {
  period: string;
  previousValue: number;
  currentValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceReadingsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7187/api/ServiceReadings';

  create(dto: ServiceReadingCreateDto): Observable<ServiceReading> {
    return this.http.post<ServiceReading>(this.apiUrl, dto);
  }

  getMy(): Observable<ServiceReading[]> {
    return this.http.get<ServiceReading[]>(`${this.apiUrl}/my`);
  }

  updateMy(id: string, dto: ServiceReadingUpdateDto): Observable<ServiceReading> {
    return this.http.put<ServiceReading>(`${this.apiUrl}/my/${id}`, dto);
  }

  getAll(): Observable<ServiceReading[]> {
    return this.http.get<ServiceReading[]>(this.apiUrl);
  }
}