import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { BranchDailyTargetHeaderCreateUpdateDto, BranchTargetPeriodReport } from '../shared/models/branch-target-period-report.model';


@Injectable({
  providedIn: 'root'
})
export class BranchDailyTargetService {

  private baseUrl = `${API_BASE_URL}/BranchDailyTarget`;

  constructor(private http: HttpClient) {}
  // رفع ملف الإكسل
importExcel(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<any>(`${this.baseUrl}/import-excel`, formData);
}

// جلب تارجت اليوم للفرع
getTodayTarget(branchId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/today-target/${branchId}`);
}


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

getBranchPeriodReport(branchId: number, fromDate: string, toDate: string) {
  return this.http.get(`${this.baseUrl}/branch-period-report`, {
    params: {
      branchId,
      fromDate,
      toDate
    }
  });
}

}
