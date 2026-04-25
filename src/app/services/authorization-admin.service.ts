import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';
@Injectable({
  providedIn: 'root'
})
export class AuthorizationAdminService {

private baseUrl = `${API_BASE_URL}/AuthorizationAdmin`;
private authBaseUrl = 'https://localhost:7025/api/Auth';
private authBaseUrl2 = `${API_BASE_URL}`;
  constructor(private http: HttpClient) {}

  updateUserData(dto: any) {
    return this.http.post<any>(`${this.baseUrl}/update-user-data`, dto);
  }

  getUsers() {
    return this.http.get<any>(`${this.baseUrl}/users`);
  }

  getRoles() {
    return this.http.get<any>(`${this.baseUrl}/roles`);
  }

  getUserRoles(userId: string) {
    return this.http.get<any>(`${this.baseUrl}/user-roles/${userId}`);
  }

  updateUserRoles(dto: { userId: string, roleNames: string[] }) {
    return this.http.post<any>(`${this.baseUrl}/user-roles`, dto);
  }

  getAllPermissions() {
    return this.http.get<any>(`${this.baseUrl}/permissions`);
  }

  getRolePermissions(roleId: string) {
    return this.http.get<any>(`${this.baseUrl}/role-permissions/${roleId}`);
  }

updateRolePermissions(dto: any) {
  return this.http.post<any>(`${this.baseUrl}/role-permissions`, dto);
}
  // 🔥 جديد: تغيير كلمة المرور بواسطة الأدمن
  adminResetPassword(dto: { userId: string; newPassword: string }) {
    return this.http.post<any>(`${this.authBaseUrl}/admin-reset-password`, dto);
  }

  getBranches() {
  return this.http.get<any>(`${this.authBaseUrl2}/Branch`);
}
}
