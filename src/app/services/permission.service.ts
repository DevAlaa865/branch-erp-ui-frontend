import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
export interface Permission {
  id: number;
  name: string;
  code: string;
}

export interface PermissionCreate {
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  // ✅ ده الـ API الجديد اللي عملناه في الباك
private baseUrl = `${API_BASE_URL}/Permissions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.baseUrl);
  }

  create(model: PermissionCreate): Observable<Permission> {
    return this.http.post<Permission>(this.baseUrl, model);
  }

  update(id: number, model: PermissionCreate): Observable<Permission> {
    return this.http.put<Permission>(`${this.baseUrl}/${id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
