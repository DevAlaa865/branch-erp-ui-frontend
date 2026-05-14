import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { map } from 'rxjs/operators';

export interface BranchDailyReturn {
  id: number;
  branchId: number;
  branchNumber: number;
  branchName: string;
  returnDate: string;
  returnAmount: number;
  returnType: number;
  notes: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BranchDailyReturnsService {

  private baseUrl = `${API_BASE_URL}/BranchDailyReturns`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // 🔥 GET RETURNS WITH ALL FILTERS
  // ============================================================
  getReturns(
    fromDate?: string,
    toDate?: string,
    branchId?: number,
    branchNumber?: number,
    cityId?: number,
    returnType?: number
  ): Observable<BranchDailyReturn[]> {

    let params = new HttpParams();

    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (branchId) params = params.set('branchId', branchId);
    if (branchNumber) params = params.set('branchNumber', branchNumber);
    if (cityId) params = params.set('cityId', cityId);
    if (returnType !== undefined && returnType !== null)
      params = params.set('returnType', returnType);

    return this.http.get<any>(this.baseUrl, { params })
      .pipe(map(res => res.data as BranchDailyReturn[]));
  }

  // ============================================================
  // 🔥 GET BY ID
  // ============================================================
  getById(id: number): Observable<BranchDailyReturn> {
    return this.http.get<any>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data as BranchDailyReturn));
  }

  // ============================================================
  // 🔥 UPDATE
  // ============================================================
  update(
    id: number,
    payload: {
      branchNumber: number;
      returnDate: string;
      returnAmount: number;
      returnType: number;
      notes?: string | null;
    }
  ): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  // ============================================================
// 🔥 EXPORT TO EXCEL
// ============================================================
exportToExcel(filter: {
  fromDate?: string;
  toDate?: string;
  branchId?: number;
  branchNumber?: number;
  cityId?: number;
  returnType?: number;
}): Observable<Blob> {

  let params = new HttpParams();

  if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
  if (filter.toDate) params = params.set('toDate', filter.toDate);
  if (filter.branchId) params = params.set('branchId', filter.branchId);
  if (filter.branchNumber) params = params.set('branchNumber', filter.branchNumber);
  if (filter.cityId) params = params.set('cityId', filter.cityId);
  if (filter.returnType !== undefined && filter.returnType !== null)
    params = params.set('returnType', filter.returnType);

  return this.http.get(`${this.baseUrl}/export`, {
    params,
    responseType: 'blob'
  });
}
// ============================================================
// 🔥 GET CHART DATA
// ============================================================
getChartData(filter: {
  fromDate?: string;
  toDate?: string;
  branchId?: number;
  branchNumber?: number;
  cityId?: number;
  returnType?: number;
}): Observable<any> {

  let params = new HttpParams();

  if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
  if (filter.toDate) params = params.set('toDate', filter.toDate);
  if (filter.branchId) params = params.set('branchId', filter.branchId);
  if (filter.branchNumber) params = params.set('branchNumber', filter.branchNumber);
  if (filter.cityId) params = params.set('cityId', filter.cityId);
  if (filter.returnType !== undefined && filter.returnType !== null)
    params = params.set('returnType', filter.returnType);

  return this.http.get<any>(`${this.baseUrl}/chart`, { params });
}

}
