import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../pages/billing/invoice.service';

export interface BillingInput {
  id?: string;
  apartmentId: string;
  period: string;
  waterM3: number;
  electricityKwh: number;
  residentsCount: number;
  comment?: string;
}

export interface BillingInputSaveDto {
  apartmentId: string;
  period: string;
  waterM3: number;
  electricityKwh: number;
  residentsCount: number;
  comment?: string;
}

export interface BillingSaveResult {
  billingInput: BillingInput;
  invoice?: Invoice | null;
}

@Injectable({
  providedIn: 'root'
})
export class BillingInputService {
  private api = 'https://localhost:7187/api/billinginputs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BillingInput[]> {
    return this.http.get<BillingInput[]>(this.api);
  }

  getById(id: string): Observable<BillingInput> {
    return this.http.get<BillingInput>(`${this.api}/${id}`);
  }

  getByApartmentAndPeriod(apartmentId: string, period: string): Observable<BillingInput> {
    return this.http.get<BillingInput>(`${this.api}/${apartmentId}/${period}`);
  }

  save(dto: BillingInputSaveDto): Observable<BillingSaveResult> {
    return this.http.post<BillingSaveResult>(`${this.api}/save`, dto);
  }

  create(data: BillingInput): Observable<BillingInput> {
    return this.http.post<BillingInput>(this.api, data);
  }

  update(id: string, data: BillingInput): Observable<BillingInput> {
    return this.http.put<BillingInput>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}