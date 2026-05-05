import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
@Injectable({
  providedIn: 'root'
})
export class EmployeeDailyTargetReportService {
private baseUrl = `${API_BASE_URL}/BranchDailyTarget`;

  constructor(private http: HttpClient) {}

  getEmployeeReport(cityId: number | null, branchId: number | null, date: string) {
    let params = new HttpParams().set('date', date);

    if (cityId) {
      params = params.set('cityId', cityId);
    }

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<any>(`${this.baseUrl}/employee-report`, { params });
  }
}
