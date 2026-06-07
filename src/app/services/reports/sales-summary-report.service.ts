import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesSummaryReportFilter, SalesSummaryReportItem } from '../../shared/models/sales-summary-report.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesSummaryReportService {

  private baseUrl = '/api/SalesSummaryReport'; // نفس اسم الكنترولر في الباك

  constructor(private http: HttpClient) {}

  getReport(filter: SalesSummaryReportFilter): Observable<ApiResponse<SalesSummaryReportItem[]>> {
    const payload = {
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      regionId: filter.regionId ?? null,
      cityId: filter.cityId ?? null,
      branchId: filter.branchId ?? null
    };

    return this.http.post<ApiResponse<SalesSummaryReportItem[]>>(
      `${this.baseUrl}/Get`,
      payload
    );
  }
}
