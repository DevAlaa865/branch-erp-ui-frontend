import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';

import {
  BankTransferRequest,
  CreateBankTransferRequest,
  BankTransferRequestFilter,
  UpdateTransferStatus
} from '../shared/models/bank-transfer-request.model';

@Injectable({
  providedIn: 'root'
})
export class BankTransferRequestService {

  private baseUrl = `${API_BASE_URL}/BankTransferRequest`;

  constructor(private http: HttpClient) { }

  create(dto: CreateBankTransferRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}`, dto);
  }

  getById(id: number): Observable<BankTransferRequest> {
    return this.http.get<BankTransferRequest>(
      `${this.baseUrl}/${id}`
    );
  }

  // ⭐⭐⭐ مهم جداً — شاشة العرض بتستخدمه
  getPending(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pending`);
  }

  search(filter: BankTransferRequestFilter): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/search`,
      filter
    );
  }

  updateStatus(dto: UpdateTransferStatus): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/update-status`,
      dto
    );
  }

  // ⭐⭐⭐ رفع الملف بعد الحفظ — مربوط بالـ requestId ⭐⭐⭐
  uploadAttachment(requestId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/upload-attachment/${requestId}`,
      formData
    );
  }

  // ⭐⭐⭐ تحديث الطلب بالـ AttachmentPath ⭐⭐⭐
  updateAttachment(requestId: number, attachmentPath: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/update-attachment`,
      {
        requestId,
        attachmentPath
      }
    );
  }
}
