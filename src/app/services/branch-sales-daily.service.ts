import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
@Injectable({
  providedIn: 'root'
})
export class BranchSalesDailyService {

private baseUrl = `${API_BASE_URL}/BranchSalesDaily`; // عدّل الـ URL حسب السيرفر

  constructor(private http: HttpClient) {}
  // 🔹 استعلام: هل اليومية موجودة لهذا الفرع وهذا التاريخ؟
  exists(branchId: number, date: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists`, {
      params: {
        branchId: branchId,
        date: date
      }
    });
  }
  create(model: any): Observable<any> {
    return this.http.post(this.baseUrl, model);
  }

  getByBranchAndDate(branchId: number, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/by-branch-date`, {
      params: { branchId, date }
    });
  }
getSummaryReport(filter: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/summary-report`, filter);
}

getReturnsDiscountsManagement(filter: any) {
  return this.http.post(`${this.baseUrl}/returns-discounts-management`, filter);
}
  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  update(id: number, model: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, model);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateShortagesApprovals(items: any[]) {
  return this.http.post(`${this.baseUrl}/update-shortages-approvals`, items);
}

}
