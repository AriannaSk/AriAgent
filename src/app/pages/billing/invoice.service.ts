import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invoice {
  id?: string;
  invoiceIdentifier?: string;
  period: string;
  total?: number;
  apartmentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private api = 'https://localhost:7187/api/invoices';

  constructor(private http: HttpClient) {}

  // MANAGER
  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.api);
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/${id}`);
  }

  create(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.api, invoice);
  }

  update(id: string, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.api}/${id}`, invoice);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // RESIDENT
  getMyInvoicesByApartment(apartmentId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.api}/my/apartment/${apartmentId}`);
  }
}