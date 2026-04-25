import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${API_BASE_URL}/Auth`;


  constructor(private http: HttpClient) {}

  login(model: { userName: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, model).pipe(
      map(res => {
        if (!res || !res.success) {
          throw new Error(res?.message || 'Invalid login');
        }

        const data = res.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.userName);

        return data;
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ============================
  // 🔥 دالة مساعدة لفك التوكن
  // ============================
  private getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // ============================
  // 🔥 قراءة الـ Roles من التوكن
  // ============================
  getRoles(): string[] {
    const payload = this.getTokenPayload();
    if (!payload) return [];

    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!role) return [];

    return Array.isArray(role) ? role : [role];
  }

  isAdmin(): boolean {
    return this.getRoles().includes('Admin');
  }

  // ============================
  // 🔥 قراءة الـ Permissions من التوكن
  // ============================
  getPermissions(): string[] {
    const payload = this.getTokenPayload();
    if (!payload) return [];

    const permissions = payload['permission'];

    if (!permissions) return [];

    return Array.isArray(permissions) ? permissions : [permissions];
  }

  hasPermission(code: string): boolean {
    return this.getPermissions().includes(code);
  }
  userHasAnyPermission(required: string[]): boolean {
  const userPermissions = this.getPermissions();
  return required.some(p => userPermissions.includes(p));
   }
  // ============================
  // 🔥 قراءة الفرع من التوكن
  // ============================
  getBranchId(): string | null {
    const payload = this.getTokenPayload();
    if (!payload) return null;

    return payload["branchId"] || null;
  }

  getBranchName(): string | null {
    const payload = this.getTokenPayload();
    if (!payload) return null;

    return payload["branchName"] || null;
  }

  // ============================
  // 🔥 قراءة اسم المستخدم من التوكن
  // ============================
  getUserName(): string | null {
    const payload = this.getTokenPayload();
    if (!payload) return null;

    // في التوكن اللي بعتّهولي: unique_name = alaa
    return payload["unique_name"] || localStorage.getItem('userName');
  }

  // ============================
  // 🔥 تجميع بيانات اليوزر (للاستخدام في يومية المبيعات)
  // ============================
  getUserInfo(): {
    userName: string | null;
    branchId: number | null;
    branchName: string | null;
  } | null {
    const payload = this.getTokenPayload();
    if (!payload) return null;

    return {
      userName: payload["unique_name"] || localStorage.getItem('userName'),
      branchId: payload["branchId"] ? Number(payload["branchId"]) : null,
      branchName: payload["branchName"] || null
    };
  }
}
