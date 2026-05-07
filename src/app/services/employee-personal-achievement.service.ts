import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  EmployeePersonalAchievementDto,
  EmployeePersonalAchievementCreateDto
} from '../shared/models/employee-target.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeePersonalAchievementService {

  private baseUrl = `${API_BASE_URL}/EmployeePersonalAchievement`;

  constructor(private http: HttpClient) {}

  // 🔹 Get achievement by personal target id
  getByPersonalTargetId(personalTargetId: number): Observable<EmployeePersonalAchievementDto | null> {
    return this.http.get<EmployeePersonalAchievementDto | null>(
      `${this.baseUrl}/by-target/${personalTargetId}`
    );
  }

  // 🔹 Create or Update achievement
  save(model: EmployeePersonalAchievementCreateDto): Observable<EmployeePersonalAchievementDto> {
    return this.http.post<EmployeePersonalAchievementDto>(`${this.baseUrl}`, model);
  }
}
