// branch-control-issue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { BranchControlIssue } from '../shared/models/branch-control-issue.model';

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
}
