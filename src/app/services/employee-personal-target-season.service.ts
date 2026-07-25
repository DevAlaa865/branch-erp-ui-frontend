import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

import {
  EmployeePersonalTargetSeasonCreate,
  EmployeePersonalTargetSeason
} from '../shared/models/employee-target-season.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeePersonalTargetSeasonService {

  private baseUrl = `${API_BASE_URL}/EmployeePersonalTargetSeason`;

  constructor(private http: HttpClient) {}

  // إنشاء تارجت الموظفة
  create(dto: EmployeePersonalTargetSeasonCreate): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, dto);
  }

  // عرض تارجت الموظفات حسب الهيدر
  getByHeader(headerId: number): Observable<EmployeePersonalTargetSeason[]> {
    return this.http.get<EmployeePersonalTargetSeason[]>(`${this.baseUrl}/by-header/${headerId}`);
  }

  // عرض تارجت موظفة واحدة
  get(id: number): Observable<EmployeePersonalTargetSeason> {
    return this.http.get<EmployeePersonalTargetSeason>(`${this.baseUrl}/${id}`);
  }
  checkShift(headerId: number) {
  return this.http.get(`api/EmployeePersonalTargetSeason/check/${headerId}`);
}
}
