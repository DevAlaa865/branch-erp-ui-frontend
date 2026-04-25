import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class DailyHeaderAttachmentService {
private baseUrl = `${API_BASE_URL}/DailyHeaderAttachments`; // عدّل البورت حسب الـ API

  constructor(private http: HttpClient) {}

  uploadHeader(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ success: boolean; path: string }>(`${this.baseUrl}/upload`, formData)
      .pipe(map(res => res.path));
  }
}
