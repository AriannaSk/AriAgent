import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  id?: string;
  nosaukums: string;
  tarifs: number;
  nodoklis: number;
  formula: string;
  type: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private api = 'https://localhost:7187/api/services';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.api);
  }

  getById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.api}/${id}`);
  }

  create(service: Service): Observable<Service> {
    return this.http.post<Service>(this.api, service);
  }

  update(id: string, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.api}/${id}`, service);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

}