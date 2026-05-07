import { HttpClient } from "@angular/common/http";
import { API_BASE_URL } from "../api.config";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class BranchDailyPerformanceTargetService {

  private baseUrl = `${API_BASE_URL}/BranchDailyPerformance`;

  constructor(private http: HttpClient) {}

  uploadExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/upload-excel`, formData);
  }
}
