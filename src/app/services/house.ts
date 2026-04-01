import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface House {

  id: string;   // Guid из ASP.NET приходит как string

  numurs: number;
  iela: string;
  pilseta: string;
  valsts: string;
  pastaIndekss: string;

}

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  private readonly apiUrl = 'https://localhost:7187/api/majas';

  constructor(private http: HttpClient) {}

  // GET all houses
  getAll(): Observable<House[]> {
    return this.http.get<House[]>(this.apiUrl);
  }

  // GET house by id
  getById(id: string): Observable<House> {
    return this.http.get<House>(`${this.apiUrl}/${id}`);
  }

  // CREATE house
  create(house: Omit<House, 'id'>): Observable<House> {
    return this.http.post<House>(this.apiUrl, house);
  }

  // UPDATE house
  update(id: string, house: House): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, house);
  }

  // DELETE house
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}