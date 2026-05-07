import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class BranchDailyPerformanceTargetService {

  private baseUrl = `${API_BASE_URL}/BranchDailyTarget`;

  constructor(private http: HttpClient) {}

  uploadExcel(file: File): Observable<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/upload-excel`,
      formData
    );
  }
}
