import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api.config';
import { BranchDailyDetailReportResponse } from '../../shared/models/branch-daily-details-report.model';

@Injectable({
  providedIn: 'root'
})
export class BranchDailyDetailsReportService {
  constructor(private http: HttpClient) {}

  getBranchDailyDetails(branchId: number, fromDate: string, toDate: string) {
    return this.http.get<BranchDailyDetailReportResponse>(
      `${API_BASE_URL}/BranchDailyDetails/GetBranchDailyDetails`,
      {
        params: {
          branchId,
          fromDate,
          toDate
        }
      }
    );
  }
}
