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

  private decodeBase64Url(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    return atob(base64);
  }

  private getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(this.decodeBase64Url(token.split('.')[1]));
    } catch {
      this.logout();
      return null;
    }
  }

  // ============================
  // 🔥 Roles
  // ============================
  getRoles(): string[] {
    const payload = this.getTokenPayload();
    if (!payload) return [];

    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return Array.isArray(role) ? role : role ? [role] : [];
  }

  // ============================
  // 🔥 Permissions
  // ============================
  getPermissions(): string[] {
    const payload = this.getTokenPayload();
    if (!payload) return [];

    const permissions = payload['permission'];
    return Array.isArray(permissions) ? permissions : permissions ? [permissions] : [];
  }

  hasPermission(code: string): boolean {
    return this.getPermissions().includes(code);
  }

  userHasAnyPermission(required: string[]): boolean {
    const userPermissions = this.getPermissions();
    return required.some(p => userPermissions.includes(p));
  }

  // ============================
  // 🔥 UserType
  // ============================
  getUserType(): number | null {
    const payload = this.getTokenPayload();
    return payload ? Number(payload["userType"]) : null;
  }

isRegionManager(): boolean {
  const payload = this.getTokenPayload();
  return payload?.userType === "RegionManager" 
      || payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "RegionManagers";
}

  // ============================
  // 🔥 Multi-City Manager
  // ============================
  getCityIds(): number[] {
    const payload = this.getTokenPayload();
    if (!payload) return [];

    const raw = payload["cityIds"];
    if (!raw) return [];

    return raw.split(',').map((x: string) => Number(x));
  }

  // ============================
  // 🔥 Branch Info
  // ============================
  getBranchId(): number | null {
    const payload = this.getTokenPayload();
    return payload && payload["branchId"] ? Number(payload["branchId"]) : null;
  }

  getBranchName(): string | null {
    const payload = this.getTokenPayload();
    return payload ? payload["branchName"] : null;
  }

  // ============================
  // 🔥 User Info (مهم للتقارير)
  // ============================
  getUserInfo(): {
    userName: string | null;
    branchId: number | null;
    branchName: string | null;
    cityIds: number[];
    userType: number | null;
  } {
    const payload = this.getTokenPayload();

    return {
      userName: payload ? payload["unique_name"] : localStorage.getItem('userName'),
      branchId: payload && payload["branchId"] ? Number(payload["branchId"]) : null,
      branchName: payload ? payload["branchName"] : null,
      cityIds: this.getCityIds(),
      userType: this.getUserType()
    };
  }
  // 🔥 قراءة اسم المستخدم
// ============================
getUserName(): string | null {
  const payload = this.getTokenPayload();
  if (!payload) return localStorage.getItem('userName');

  return payload["unique_name"] || localStorage.getItem('userName');
}
}
