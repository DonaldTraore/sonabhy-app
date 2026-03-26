import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Direction { id: number; nom: string }
export interface Service { id: number; nom: string; direction_id: number }
export interface Employee {
  id: number;
  prenom: string;
  nom: string;
  fonction: string;
  email?: string;
  telephone?: string;
  service_id: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) {}

  // Directions
  getDirections(): Observable<Direction[]> { return this.http.get<Direction[]>(`${this.base}/api/directions`); }
  createDirection(payload: { nom: string }) { return this.http.post<Direction>(`${this.base}/api/directions`, payload); }
  updateDirection(id: number, payload: { nom?: string }) { return this.http.patch<Direction>(`${this.base}/api/directions/${id}`, payload); }
  deleteDirection(id: number) { return this.http.delete<{ ok: boolean }>(`${this.base}/api/directions/${id}`); }

  // Services
  getServices(directionId?: number): Observable<Service[]> {
    let params = new HttpParams();
    if (directionId != null) params = params.set('direction_id', String(directionId));
    return this.http.get<Service[]>(`${this.base}/api/services`, { params });
  }
  createService(payload: { nom: string; direction_id: number }) { return this.http.post<Service>(`${this.base}/api/services`, payload); }
  updateService(id: number, payload: { nom?: string; direction_id?: number }) { return this.http.patch<Service>(`${this.base}/api/services/${id}`, payload); }
  deleteService(id: number) { return this.http.delete<{ ok: boolean }>(`${this.base}/api/services/${id}`); }

  // Employees search/list
  getEmployees(options: { q?: string; directionId?: number; serviceId?: number } = {}): Observable<Employee[]> {
    let params = new HttpParams();
    if (options.q) params = params.set('q', options.q);
    if (options.directionId != null) params = params.set('direction_id', String(options.directionId));
    if (options.serviceId != null) params = params.set('service_id', String(options.serviceId));
    return this.http.get<Employee[]>(`${this.base}/api/employees`, { params });
  }
  createEmployee(payload: { prenom: string; nom: string; fonction: string; email?: string; telephone?: string; service_id: number }) { return this.http.post<Employee>(`${this.base}/api/employees`, payload); }
  updateEmployee(id: number, payload: Partial<{ prenom: string; nom: string; fonction: string; email?: string; telephone?: string; service_id: number }>) { return this.http.patch<Employee>(`${this.base}/api/employees/${id}`, payload); }
  deleteEmployee(id: number) { return this.http.delete<{ ok: boolean }>(`${this.base}/api/employees/${id}`); }
}
