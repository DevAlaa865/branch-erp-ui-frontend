import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

import {
  EmployeePersonalAchievementSeason,
  EmployeePersonalAchievementSeasonCreate
} from '../shared/models/employee-target-season.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeePersonalAchievementSeasonService {

  private baseUrl = `${API_BASE_URL}/EmployeePersonalAchievementSeason`;

  constructor(private http: HttpClient) {}

  // إنشاء المتحقق
  create(dto: EmployeePersonalAchievementSeasonCreate): Observable<EmployeePersonalAchievementSeason> {
    return this.http.post<EmployeePersonalAchievementSeason>(`${this.baseUrl}`, dto);
  }

  // عرض المتحقق حسب الهيدر
  getByHeader(headerId: number): Observable<EmployeePersonalAchievementSeason[]> {
    return this.http.get<EmployeePersonalAchievementSeason[]>(`${this.baseUrl}/by-header/${headerId}`);
  }

  // عرض متحقق موظفة واحدة
  get(id: number): Observable<EmployeePersonalAchievementSeason> {
    return this.http.get<EmployeePersonalAchievementSeason>(`${this.baseUrl}/${id}`);
  }
}
