import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api.config';
import {
  AccountsReturnsDiscountsReport,
  AccountsReturnsDiscountsReportFilter
} from '../../shared/models/accounts-returns-discounts-report.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsReturnsDiscountsReportService {

  private baseUrl = `${API_BASE_URL}/BranchDailyDifferenceReport`;

  constructor(private http: HttpClient) {}

  getReport(filter: AccountsReturnsDiscountsReportFilter):
    Observable<AccountsReturnsDiscountsReport[]> {

    return this.http.post<AccountsReturnsDiscountsReport[]>(
      `${this.baseUrl}/GetAccountsReturnsDiscountsReport`,
      filter
    );
  }
}
