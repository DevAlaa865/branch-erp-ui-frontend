import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
@Injectable({ providedIn: 'root' })
export class ShortageAttachmentService {
private baseUrl = `${API_BASE_URL}/ShortageAttachments`;

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ success: boolean; path: string }>(`${this.baseUrl}/upload`, formData)
      .pipe(map(res => res.path));
  }
}
