import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  BranchMonthlyTargetSeasonExcelUploadDto,
  BranchMonthlyTargetSeasonReportFilterDto,
  BranchMonthlyTargetSeasonReportRowDto
} from '../shared/models/branch-monthly-target-season.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class BranchMonthlyTargetSeasonService {

  private baseUrl = `${API_BASE_URL}/BranchMonthlyTargetSeason`;

  constructor(private http: HttpClient) {}

uploadExcel(data: BranchMonthlyTargetSeasonExcelUploadDto) {
  return this.http.post(`${this.baseUrl}/upload`, data);
}

  getMonthlyReport(filter: BranchMonthlyTargetSeasonReportFilterDto) {
    return this.http.post<BranchMonthlyTargetSeasonReportRowDto[]>(
      `${this.baseUrl}/report`,
      filter
    );
  }
}
