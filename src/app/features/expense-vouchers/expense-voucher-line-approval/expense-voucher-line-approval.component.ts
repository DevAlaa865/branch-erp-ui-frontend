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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ExpenseVoucherService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
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

  // هل اليوزر له صلاحية اعتماد هذا الدور؟
  canApprove(role: number): boolean {
    return this.currentUserRole === role || this.auth.isAdmin?.();
  }

  // اسم الدور للعرض
getRoleName(role: number): string {
  switch (role) {
    case 1: return 'المدير العام - سامي';
    case 2: return 'مدير الـ HR - نايل';
    case 3: return 'مدير المصاريف البنكية - نزار';
    case 4: return 'مدير السيارات - فيصل';
    case 5: return 'مدير المبيعات - عبد الوهاب';
    case 6: return 'الحسابات - المحاسب';
    default: return 'غير معروف';
  }
}


  // هل تم اعتماد هذا الدور؟
  isApproved(line: any, role: number): boolean {
    return !!line.approvals?.find((a: any) => a.role === role);
  }

  // الحصول على بيانات الاعتماد
  getApproval(line: any, role: number) {
    return line.approvals?.find((a: any) => a.role === role) ?? null;
  }

  // اعتماد خانة معينة مباشرة
  approveLineRole(lineId: number, role: number) {
    const dto = {
      lineId,
      role,
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

  // فتح مودال اعتماد بند كامل
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

  // 🔥 الرسالة + الرجوع للقائمة
  showSuccessAndRedirect() {
    alert('✔ تم اعتماد السند بنجاح\nسيتم الرجوع لقائمة سندات الصرف');

    setTimeout(() => {
      this.router.navigate(['/cash-management/expenses/expense-voucher']);
    }, 1500);
  }
}
