import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, IMAGE_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class TargetAttachmentsService {

  private baseUrl = `${API_BASE_URL}/TargetAttachments/upload`;

  constructor(private http: HttpClient) {}

  // 🔹 Upload file (image/pdf)
  upload(file: File): Observable<{ success: boolean; path: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; path: string }>(this.baseUrl, formData);
  }

  // 🔹 تحويل المسار النسبي لمسار كامل للعرض
  getFullImageUrl(relativePath: string): string {
    return `${IMAGE_BASE_URL}${relativePath}`;
  }
}
