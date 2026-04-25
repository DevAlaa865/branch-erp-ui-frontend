import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

private baseUrl = `${API_BASE_URL}`;

  constructor(private http: HttpClient) {}

  // ============================
  // Countries
  // ============================
  getCountries(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/Country`);
  }

  createCountry(payload: { countryName: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Country`, payload);
  }

  updateCountry(id: number, payload: { countryName: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/Country/${id}`, payload);
  }

  deleteCountry(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/Country/${id}`);
  }

  // ❗ مهم جدًا: دي عشان Country Component
  searchCountriesLocal(list: any[], term: string) {
    if (!term || term.trim() === '') return list;

    term = term.toLowerCase();

    return list.filter(c =>
      c.name.toLowerCase().includes(term) ||
      String(c.id).includes(term)
    );
  }

  // ============================
  // Cities
  // ============================
  getCities(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/City`);
  }

  createCity(payload: { cityName: string; countryId: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/City`, payload);
  }

  updateCity(id: number, payload: { cityName: string; countryId: number }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/City/${id}`, payload);
  }

  deleteCity(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/City/${id}`);
  }

  // Areas (المناطق / الريجن)
  // ============================
 getAreas() {
  return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/Region`);
}

createArea(payload: { areaName: string; cityId: number }) {
  return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Region`, {
    regionName: payload.areaName,
    cityId: payload.cityId
  });
}

updateArea(id: number, payload: { areaName: string; cityId: number }) {
  return this.http.put<ApiResponse<any>>(`${this.baseUrl}/Region/${id}`, {
    regionName: payload.areaName,
    cityId: payload.cityId
  });
}

deleteArea(id: number) {
  return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/Region/${id}`);
}

// Activity Types (نوعية النشاط)
// ============================

getActivityTypes() {
  return this.http.get<any>(`${this.baseUrl}/ActivityType`);
}

createActivityType(payload: { name: string }) {
  return this.http.post<any>(`${this.baseUrl}/ActivityType`, {
    activityName: payload.name
  });
}

updateActivityType(id: number, payload: { name: string }) {
  return this.http.put<any>(`${this.baseUrl}/ActivityType/${id}`, {
    activityName: payload.name
  });
}

deleteActivityType(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/ActivityType/${id}`);
}
searchActivityTypesLocal(list: any[], term: string) {
  if (!term) return [...list];
  const value = term.toLowerCase();
  return list.filter(x => (x.name || '').toLowerCase().includes(value));
}
// ============================
// Shortage Types (أنواع العجز)
// ============================

getShortageTypes() {
  return this.http.get<any>(`${this.baseUrl}/ShortageType`);
}

createShortageType(payload: { name: string }) {
  return this.http.post<any>(`${this.baseUrl}/ShortageType`, {
    shortageName: payload.name
  });
}

updateShortageType(id: number, payload: { name: string }) {
  return this.http.put<any>(`${this.baseUrl}/ShortageType/${id}`, {
    shortageName: payload.name
  });
}

deleteShortageType(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/ShortageType/${id}`);
}

searchShortageTypesLocal(list: any[], term: string) {
  if (!term) return [...list];
  const value = term.toLowerCase();
  return list.filter(x => (x.name || '').toLowerCase().includes(value));
}
// ============================
// ============================
// ============================
// Employees (الموظفين)
// ============================

getEmployees() {
  return this.http.get<any>(`${this.baseUrl}/Employee`);
}

createEmployee(payload: any) {
  return this.http.post<any>(`${this.baseUrl}/Employee`, {
    employeeCode: payload.employeeCode,
    fullName: payload.fullName,
    phone: payload.phone,
    gender: payload.gender,
    position: payload.position,
    isSupervisor: payload.isSupervisor,
    isActive: payload.isActive
  });
}

updateEmployee(id: number, payload: any) {
  return this.http.put<any>(`${this.baseUrl}/Employee/${id}`, {
    employeeCode: payload.employeeCode,
    fullName: payload.fullName,
    phone: payload.phone,
    gender: payload.gender,
    position: payload.position,
    isSupervisor: payload.isSupervisor,
    isActive: payload.isActive
  });
}

deleteEmployee(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/Employee/${id}`);
}

searchEmployeesLocal(list: any[], term: string) {
  if (!term) return [...list];
  const value = term.toLowerCase();
  return list.filter(x =>
    x.fullName.toLowerCase().includes(value) ||
    x.employeeCode.toLowerCase().includes(value) ||
    (x.phone ?? '').includes(term) ||
    String(x.id).includes(term)
  );
}

// ============================
// Branches
// ============================

getBranches() {
  return this.http.get<any>(`${this.baseUrl}/Branch`);
}

getBranchById(id: number) {
  return this.http.get<any>(`${this.baseUrl}/Branch/${id}`);
}

createBranch(payload: any) {
  return this.http.post<any>(`${this.baseUrl}/Branch`, payload);
}

updateBranch(id: number, payload: any) {
  return this.http.put<any>(`${this.baseUrl}/Branch/${id}`, payload);
}

deleteBranch(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/Branch/${id}`);
}

searchBranchesLocal(list: any[], term: string) {
  if (!term) return [...list];
  const value = term.toLowerCase();
  return list.filter(x =>
    x.branchName.toLowerCase().includes(value) ||
    String(x.branchNumber).includes(value) ||
    x.cityName?.toLowerCase().includes(value) ||
    x.activityTypeName?.toLowerCase().includes(value)
  );
}
  // ❗ دي دالة عامة نستخدمها في City وباقي الموديولات
  searchLocal(list: any[], term: string, field: string = 'name') {
    if (!term || term.trim() === '') return list;

    term = term.toLowerCase();

    return list.filter(item =>
      String(item.id).includes(term) ||
      item[field]?.toLowerCase().includes(term)
    );
  }
getBranchesByCity(cityId: number) {
  return this.http.get(`${this.baseUrl}/Branch/by-city/${cityId}`);
}

}
