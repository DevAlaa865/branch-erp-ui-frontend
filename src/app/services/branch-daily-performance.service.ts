import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  BranchDailyPerformanceDto,
  BranchDailyPerformanceCreateUpdateDto
} from '../shared/models/employee-target.models';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class BranchDailyPerformanceService {

  private baseUrl = `${API_BASE_URL}/BranchDailyPerformance`;

  constructor(private http: HttpClient) {}

get(branchId: number, date: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}`, {
    params: { branchId, date }
  });
}


  saveAchievement(model: BranchDailyPerformanceCreateUpdateDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/achievement`, model);
  }
}
