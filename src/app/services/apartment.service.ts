import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apartment } from './apartment';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private apiUrl = 'https://localhost:7187/api/Dzivoklis';

  constructor(private http: HttpClient) {}

  // MANAGER
  getByHouseId(houseId: string): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.apiUrl}/byHouse/${houseId}`);
  }

  getById(id: string): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apiUrl}/${id}`);
  }

  update(id: string, apartment: Apartment): Observable<Apartment> {
    return this.http.put<Apartment>(`${this.apiUrl}/${id}`, apartment);
  }

  create(apartment: Apartment): Observable<Apartment> {
    return this.http.post<Apartment>(this.apiUrl, apartment);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // RESIDENT
  getMyApartments(): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(`${this.apiUrl}/my`);
  }

  getMyApartmentById(id: string): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apiUrl}/my/${id}`);
  }

  updateMyApartment(id: string, apartment: any) {
    return this.http.put(`${this.apiUrl}/my/${id}`, apartment);
  }
}