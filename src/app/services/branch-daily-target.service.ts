import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface BranchDailyTargetDetailDto {
  id?: number;
  employeeId: number;
  employeeName?: string;
  shift: number;
  employeeTarget?: number | null;
  employeeAchieved?: number | null;
  employeeAchievementPercentage?: number | null;
  employeeCommission?: number | null;
}

export interface BranchDailyTargetHeaderDto {
  id: number;
  branchId: number;
  branchName?: string;
  targetDate: string;
  totalBranchTarget?: number | null;
  totalAchieved?: number | null;
  achievementPercentage?: number | null;
  branchCommission?: number | null;
  details: BranchDailyTargetDetailDto[];
}

export interface BranchDailyTargetDetailCreateUpdateDto {
  employeeId: number;
  shift: number;
  employeeTarget?: number | null;
  employeeAchieved?: number | null;
}

export interface BranchDailyTargetHeaderCreateUpdateDto {
  branchId: number;
  targetDate: string;
  totalBranchTarget?: number | null;
  totalAchieved?: number | null;
  details: BranchDailyTargetDetailCreateUpdateDto[];
}

@Injectable({
  providedIn: 'root'
})
export class BranchDailyTargetService {

  private baseUrl = `${API_BASE_URL}/BranchDailyTarget`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getByBranchAndDate(branchId: number, date: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-branch-date`, {
      params: {
        branchId: branchId.toString(),
        date
      }
    });
  }

  create(model: BranchDailyTargetHeaderCreateUpdateDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, model);
  }

  update(id: number, model: BranchDailyTargetHeaderCreateUpdateDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, model);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
