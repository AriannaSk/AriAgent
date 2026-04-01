import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillingInputSaveDto {
  apartmentId: string;
  period: string;
  waterM3: number;
  electricityKwh: number;
  residentsCount: number;
  comment?: string;
}

export interface BillingInputReadDto {
  id: string;
  apartmentId: string;
  period: string;
  waterM3: number;
  electricityKwh: number;
  residentsCount: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingInputService {
  private api = 'https://localhost:7187/api/billinginputs';

  constructor(private http: HttpClient) {}

  save(dto: BillingInputSaveDto): Observable<{
    billingInput: BillingInputReadDto;
    invoice: any;
  }> {
    return this.http.post<{
      billingInput: BillingInputReadDto;
      invoice: any;
    }>(`${this.api}/save`, dto);
  }

  getByApartmentAndPeriod(apartmentId: string, period: string): Observable<BillingInputReadDto> {
    return this.http.get<BillingInputReadDto>(`${this.api}/${apartmentId}/${period}`);
  }
}