import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class PettyHolderService {

  private baseUrl = `${API_BASE_URL}/PettyHolder`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  create(body: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, body);
  }

  update(body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${body.id}`, body);
  }

  activate(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
