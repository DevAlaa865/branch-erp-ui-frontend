import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api.config';
import { BranchDailyDifferenceReport, BranchDailyDifferenceReportFilter } from '../../shared/models/branch-daily-difference-report.model';

@Injectable({
  providedIn: 'root'
})
export class BranchDailyDifferenceReportService {

  private baseUrl = `${API_BASE_URL}/BranchDailyDifferenceReport`;

  constructor(private http: HttpClient) { }

  getReport(filter: BranchDailyDifferenceReportFilter): Observable<BranchDailyDifferenceReport[]> {
    return this.http.post<BranchDailyDifferenceReport[]>(`${this.baseUrl}/GetReport`, filter);
  }
}
