import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../api.config';
import { CreateExpenseVoucherRequest, ExpenseVoucher } from '../../shared/models/expense-voucher.model';



@Injectable({
  providedIn: 'root'
})
export class ExpenseVoucherService {

  private voucherUrl = `${API_BASE_URL}/ExpenseVoucher`;
  private attachmentUrl = `${API_BASE_URL}/ExpenseVoucherAttachment`;
  private approvalUrl = `${API_BASE_URL}/ExpenseVoucherApproval`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // Create Voucher
  // ============================================================
  create(dto: CreateExpenseVoucherRequest) {
    return this.http.post<ExpenseVoucher>(`${this.voucherUrl}`, dto);
  }

  // ============================================================
  // Get All
  // ============================================================
  getAll(filters: any = {}) {
    return this.http.get<ExpenseVoucher[]>(`${this.voucherUrl}`, {
      params: filters
    });
  }

  // ============================================================
  // Get By Id
  // ============================================================
  getById(id: number) {
    return this.http.get<ExpenseVoucher>(`${this.voucherUrl}/${id}`);
  }

  // ============================================================
  // Submit Voucher
  // ============================================================
  submit(id: number) {
    return this.http.post(`${this.voucherUrl}/${id}/submit`, {});
  }

  // ============================================================
  // Approve Voucher
  // ============================================================
  approve(dto: {
    voucherId: number;
    approvedByUserId: string;
    managerNotes?: string;
  }) {
    return this.http.post<ExpenseVoucher>(`${this.voucherUrl}/approve`, dto);
  }

  // ============================================================
  // Delete Voucher
  // ============================================================
  delete(id: number) {
    return this.http.delete(`${this.voucherUrl}/${id}`);
  }

  // ============================================================
  // Get My Vouchers
  // ============================================================
  getMyVouchers() {
    return this.http.get<ExpenseVoucher[]>(`${this.voucherUrl}/my`);
  }

  // ============================================================
  // Upload Single Attachment
  // ============================================================
  uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; url: string }>(
      `${this.attachmentUrl}/upload`,
      formData
    );
  }

  // ============================================================
  // Upload Multiple Attachments
  // ============================================================
  uploadMultiple(files: File[]) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    return this.http.post<{ success: boolean; urls: string[] }>(
      `${this.attachmentUrl}/upload-multiple`,
      formData
    );
  }

  // ============================================================
  // Approve Line
  // ============================================================
  approveLine(dto: {
    lineId: number;
    role: number;
    approvedByUserId: string;
    notes?: string;
  }) {
    return this.http.post(`${this.approvalUrl}/approve-line`, dto);
  }

  getDepositSummary(): Observable<{ totalDelivered: number; totalSpent: number }> {
  return this.http.get<{ totalDelivered: number; totalSpent: number }>(
    `${this.voucherUrl}/summary`
  );
}

}
