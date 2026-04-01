import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Leasehold {

  id?: string
  apartmentId: string
  majaId: string

}

@Injectable({
  providedIn: 'root'
})
export class LeaseholdService {

  private api = 'https://localhost:7187/api/leaseholds';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Leasehold[]> {
    return this.http.get<Leasehold[]>(this.api);
  }

  getById(id: string): Observable<Leasehold> {
    return this.http.get<Leasehold>(`${this.api}/${id}`);
  }

  create(data: Leasehold): Observable<Leasehold> {
    return this.http.post<Leasehold>(this.api, data);
  }

  update(id: string, data: Leasehold): Observable<Leasehold> {
    return this.http.put<Leasehold>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

}