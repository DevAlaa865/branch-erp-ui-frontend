import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { 
  BranchDailyTargetSeasonExcelUploadDto,
  BranchDailyTargetSeasonDto,
  BranchDailyTargetSeasonUpdateDto
} from '../shared/models/branch-daily-target-season.model';

@Injectable({
  providedIn: 'root'
})
export class BranchDailyTargetSeasonService {

  private baseUrl = `${API_BASE_URL}/BranchDailyTargetSeason`;

  constructor(private http: HttpClient) {}

  uploadExcel(data: BranchDailyTargetSeasonExcelUploadDto) {
    return this.http.post(`${this.baseUrl}/upload-excel`, data);
  }

getDailyTarget(branchId: number, date: string) {
  return this.http.get<BranchDailyTargetSeasonDto | null>(
    `${this.baseUrl}/daily-target?branchId=${branchId}&date=${date}`
  );
}

  updateTarget(dto: BranchDailyTargetSeasonUpdateDto) {
    return this.http.put(`${this.baseUrl}/update`, dto);
  }
}
