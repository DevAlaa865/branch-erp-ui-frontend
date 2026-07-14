import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BranchDailyTargetSeasonChartDto,
  BranchDailyTargetSeasonReportFilterDto,
  BranchDailyTargetSeasonReportRowDto
} from '../../shared/models/branch-daily-target-season.model';
import { API_BASE_URL } from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class BranchDailyTargetSeasonReportService {

  private baseUrl = `${API_BASE_URL}/BranchDailyTargetSeasonReport`;
  private chartUrl = `${API_BASE_URL}/BranchDailyTargetSeasonChart`;

  constructor(private http: HttpClient) {}

  getReport(filter: BranchDailyTargetSeasonReportFilterDto) {
    return this.http.post<BranchDailyTargetSeasonReportRowDto[]>(
      `${this.baseUrl}/report`,
      filter
    );
  }

  getChart(filter: BranchDailyTargetSeasonReportFilterDto) {
    return this.http.post<BranchDailyTargetSeasonChartDto[]>(
      `${this.chartUrl}/chart`,
      filter
    );
  }
}
