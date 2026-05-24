// branch-control-issue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { BranchControlIssue } from '../shared/models/branch-control-issue.model';
import { AccountantBranchControlIssue } from '../shared/models/accountant-branch-control-issue.model';
import { AccountantBranchControlIssueDetails } from '../shared/models/accountant-branch-control-issue-details.model';

@Injectable({
  providedIn: 'root'
})
export class BranchControlIssueService {
  private baseUrl = `${API_BASE_URL}/BranchControlIssues`;

  constructor(private http: HttpClient) {}

  // ⭐ إرسال الحالات إلى جدول الرقابة (زرار تقرير الفرق)
  transferIssues(issues: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfer`, issues);
  }

  // ⭐ عرض الحالات (شاشة الرقابة) — ✅ تعديل هنا
  getAll(filter: any): Observable<BranchControlIssue[]> {
    return this.http.post<BranchControlIssue[]>(`${this.baseUrl}/filter`, filter);
  }

  // ⭐ تحديث الحالة (شاشة الرقابة)
  updateIssue(dto: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, dto);
  }

  getManagerReport(filter: any): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/manager-report`, { params: filter });
}
managerApprove(dto: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/manager-approve`, dto);
}
getAccountantReport(filter: any) {
  return this.http.post<AccountantBranchControlIssue[]>(`${this.baseUrl}/accountant-report`, filter);
}

getAccountantDetails(id: number) {
  return this.http.get<AccountantBranchControlIssueDetails>(`${this.baseUrl}/accountant-report/${id}`);
}


}
