import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CashPostingResultDto, PostDailyCashRequestDto } from '../../shared/models/cash-posting.model';
import { API_BASE_URL } from '../../api.config';
import { ManualPostingRequest, ManualPostingResult } from '../../shared/models/manual-posting.model';
import { PostingHistory } from '../../shared/models/posting-history.model';
import { PostingDetails } from '../../shared/models/posting-details.model';

@Injectable({
  providedIn: 'root'
})
export class CashPostingService {

  private baseUrl = `${API_BASE_URL}/CashPosting`;

  constructor(private http: HttpClient) {}

  postDailyCash(model: PostDailyCashRequestDto): Observable<CashPostingResultDto> {
    return this.http.post<CashPostingResultDto>(
      `${this.baseUrl}/post-daily-cash`,
      model
    );
  }

   // 🔥 الترحيل اليدوي
  manualPost(body: ManualPostingRequest): Observable<ManualPostingResult> {
    return this.http.post<ManualPostingResult>(`${this.baseUrl}/manual`, body);
  }

  getPostingHistory(date: string): Observable<PostingHistory[]> {
  return this.http.get<PostingHistory[]>(`${this.baseUrl}/history?date=${date}`);
}

getPostingDetails(id: number): Observable<PostingDetails> {
  return this.http.get<PostingDetails>(`${this.baseUrl}/details/${id}`);
}
}
