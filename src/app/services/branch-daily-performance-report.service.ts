import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { map } from 'rxjs/operators';

export interface BranchDailyPerformanceReportFilterDto {
  date: string;
  cityId?: number;
  branchId?: number;
}

export interface BranchDailyPerformanceReportRowDto {
  branchId: number;
  branchName: string;
  cityName: string;
  targetDate: string;
  targetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;
  commissionAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BranchDailyPerformanceReportService {

  private apiUrl = `${API_BASE_URL}/BranchDailyPerformance`;

  constructor(private http: HttpClient) {}

  // 🔹 جلب التقرير
  getReport(filter: BranchDailyPerformanceReportFilterDto): Observable<BranchDailyPerformanceReportRowDto[]> {
    return this.http.post<any>(`${this.apiUrl}/report`, filter).pipe(
      map((res) => res.data)
    );
  }

  // 🔹 تصدير Excel
exportToExcel(filter: BranchDailyPerformanceReportFilterDto): Observable<Blob> {
  return this.http.post(`${this.apiUrl}/export-excel`, filter, {
    responseType: 'blob'
  });
}

  // 🔹 جلب بيانات الشارت (لو هنعمل API منفصل)
getChartData(filter: BranchDailyPerformanceReportFilterDto): Observable<any[]> {
  return this.http.post<any>(`${this.apiUrl}/chart-data`, filter).pipe(
    map(res => res.data)
  );
}


  // 🔹 جلب المدن
  getCities(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/master/cities`);
  }

  // 🔹 جلب الفروع حسب المدينة
  getBranchesByCity(cityId: number): Observable<any[]> {
    return this.http.post<any[]>(`${API_BASE_URL}/master/branches/by-cities`, { cityIds: [cityId] });
  }
}
