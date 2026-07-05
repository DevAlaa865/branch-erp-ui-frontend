import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class DepositCollectorService {

  private baseUrl = `${API_BASE_URL}/DepositCollector`;

  constructor(private http: HttpClient) {}

  getAll(isActive?: boolean): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive);
    }
    return this.http.get<any[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(body: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, body);
  }

  update(body: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${body.id}`, body);
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
