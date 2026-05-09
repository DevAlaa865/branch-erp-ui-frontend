import { Injectable } from "@angular/core";
import { API_BASE_URL } from "../api.config";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class BranchNetworkShortageReportService {

  private baseUrl = `${API_BASE_URL}/BranchSalesDaily`;

  constructor(private http: HttpClient) {}

  getReport(filter: any) {
    return this.http.post<any>(`${this.baseUrl}/branch-network-shortages`, filter);
  }

  getTotalShortage(row: any): number {
    return row.shortages.reduce((sum: number, s: any) => sum + s.amount, 0);
  }
}
