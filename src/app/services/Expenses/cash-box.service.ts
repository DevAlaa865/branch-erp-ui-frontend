import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class CashBoxService {

  private baseUrl = `${API_BASE_URL}/CashBox`;

  constructor(private http: HttpClient) {}

getAll() {
  return this.http.get<any>(`${this.baseUrl}`);
}

  getById(id: number) {
    return this.http.get<any>(`${API_BASE_URL}/get/${id}`);
  }

create(body: any) {
  return this.http.post(`${API_BASE_URL}/CashBox`, body);
}

update(body: any) {
  return this.http.put<any>(`${this.baseUrl}/${body.id}`, body);
}

  setActive(id: number, isActive: boolean) {
    return this.http.put<any>(`${this.baseUrl}/set-active/${id}?isActive=${isActive}`, {});
  }

  
}
