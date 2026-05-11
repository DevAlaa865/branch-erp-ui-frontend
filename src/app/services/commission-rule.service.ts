import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommissionRuleDto, CommissionRuleCreateUpdateDto } from '../shared/models/commission-rule.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class CommissionRuleService {

  private apiUrl = `${API_BASE_URL}/CommissionRule`;   // 👈 كده صح 100%

  constructor(private http: HttpClient) {}

  getAll(): Observable<CommissionRuleDto[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => res.data as CommissionRuleDto[])
    );
  }

  getById(id: number): Observable<CommissionRuleDto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.data as CommissionRuleDto)
    );
  }

  create(dto: CommissionRuleCreateUpdateDto): Observable<CommissionRuleDto> {
    return this.http.post<any>(this.apiUrl, dto).pipe(
      map((res: any) => res.data as CommissionRuleDto)
    );
  }

  update(id: number, dto: CommissionRuleCreateUpdateDto): Observable<CommissionRuleDto> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
      map((res: any) => res.data as CommissionRuleDto)
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.success as boolean)
    );
  }
}
