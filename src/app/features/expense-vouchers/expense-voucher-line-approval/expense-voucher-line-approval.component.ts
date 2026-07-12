import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { AuthService } from '../../../services/auth.service';
import { ExpenseVoucher } from '../../../shared/models/expense-voucher.model';
import { IMAGE_BASE_URL } from '../../../api.config';

@Component({
  selector: 'app-expense-voucher-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-voucher-line-approval.component.html',
})
export class ExpenseVoucherLineApprovalComponent implements OnInit {

  voucherId!: number;
  voucher!: ExpenseVoucher | null;

  IMAGE_BASE_URL = IMAGE_BASE_URL;

  selectedLineId: number | null = null;

  currentUserRole: number = 0;

  role: number = 0;
  notes: string = '';

  loading = true;

  // ⭐ الأدوار حسب الـ Enum في الباك
  approvalRoles = [
    { id: 1, name: 'المدير العام - سامي' },
    { id: 2, name: 'مدير الـ HR - نايل' },
    { id: 3, name: 'مدير المصاريف البنكية - نزار' },
    { id: 4, name: 'مدير السيارات - فيصل' },
    { id: 5, name: 'مدير المبيعات - عبد الوهاب' },
    { id: 6, name: 'الحسابات - المحاسب' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ExpenseVoucherService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Current User Role:', this.currentUserRole);
    this.voucherId = Number(this.route.snapshot.paramMap.get('voucherId'));
    this.currentUserRole = this.auth.getUserRole();
    this.loadVoucher();
  }

  loadVoucher() {
    this.loading = true;
    this.service.getById(this.voucherId).subscribe({
      next: res => {
        this.voucher = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // ⭐ هل اليوزر له صلاحية اعتماد هذا الدور؟
  canApprove(roleId: number): boolean {
    return this.currentUserRole === roleId || this.auth.isAdmin?.();
  }

  // ⭐ هل تم اعتماد هذا الدور؟
  isApproved(line: any, roleId: number): boolean {
    return !!line.approvals?.find((a: any) => a.role === roleId);
  }

  // ⭐ الحصول على بيانات الاعتماد
  getApproval(line: any, roleId: number) {
    return line.approvals?.find((a: any) => a.role === roleId) ?? null;
  }

  // ⭐ اعتماد بند معين مباشرة
  approveLineRole(lineId: number, roleId: number) {
    const dto = {
      lineId,
      role: roleId,
      approvedByUserId: this.auth.getUserId() ?? '',
      notes: this.notes
    };

    this.service.approveLine(dto).subscribe({
      next: () => {
        this.showSuccessAndRedirect();
      },
      error: err => console.error(err)
    });
  }

  // ⭐ فتح مودال اعتماد بند كامل
  openLineApproval(lineId: number) {
    this.selectedLineId = lineId;
    this.role = this.currentUserRole;
    this.notes = '';
  }

  approveSelectedLine() {
    if (!this.selectedLineId || !this.voucher) return;

    const dto = {
      lineId: this.selectedLineId,
      role: this.role,
      approvedByUserId: this.auth.getUserId() ?? '',
      notes: this.notes
    };

    this.service.approveLine(dto).subscribe({
      next: () => {
        this.selectedLineId = null;
        this.showSuccessAndRedirect();
      },
      error: err => console.error(err)
    });
  }

  // ⭐ الرسالة + الرجوع للقائمة
  showSuccessAndRedirect() {
    alert('✔ تم اعتماد السند بنجاح\nسيتم الرجوع لقائمة سندات الصرف');

    setTimeout(() => {
      this.router.navigate(['/cash-management/expenses/expense-voucher']);
    }, 1500);
  }
}
