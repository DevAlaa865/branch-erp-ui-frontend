import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

import {
  EmployeeShiftTargetSeasonHeader,
  EmployeeShiftTargetSeasonExcelUploadDto
} from '../shared/models/employee-target-season.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeShiftTargetSeasonHeaderService {

  private baseUrl = `${API_BASE_URL}/EmployeeShiftTargetSeasonHeader`;

  constructor(private http: HttpClient) {}

  // رفع تارجت الموظفات Season (JSON)
  uploadExcel(dto: EmployeeShiftTargetSeasonExcelUploadDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload-excel`, dto);
  }

  // عرض الهيدرز
  getHeaders(): Observable<EmployeeShiftTargetSeasonHeader[]> {
    return this.http.get<EmployeeShiftTargetSeasonHeader[]>(`${this.baseUrl}/list`);
  }

  // عرض هيدر واحد
  getHeader(id: number): Observable<EmployeeShiftTargetSeasonHeader> {
    return this.http.get<EmployeeShiftTargetSeasonHeader>(`${this.baseUrl}/${id}`);
  }

  getTodayHeader(branchId: number): Observable<any> {
  const today = new Date().toISOString().split('T')[0];
  return this.http.get<any>(
    `${this.baseUrl}/today-header?branchId=${branchId}&date=${today}`
  );
}

}
