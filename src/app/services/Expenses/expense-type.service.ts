import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ExpenseType } from '../../shared/models/expense-type.model';
import { API_BASE_URL } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypeService {

private baseUrl = `${API_BASE_URL}/ExpenseType`;

  constructor(private http: HttpClient) {}

  getAll(isActive?: boolean): Observable<ExpenseType[]> {
    return this.http.get<ExpenseType[]>(`${this.baseUrl}?isActive=${isActive ?? ''}`);
  }

  getById(id: number): Observable<ExpenseType> {
    return this.http.get<ExpenseType>(`${this.baseUrl}/${id}`);
  }

  create(dto: ExpenseType): Observable<ExpenseType> {
    return this.http.post<ExpenseType>(this.baseUrl, dto);
  }

  update(dto: ExpenseType): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.id}`, dto);
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
