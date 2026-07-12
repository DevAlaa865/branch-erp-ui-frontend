import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ExpenseVoucher } from '../../../shared/models/expense-voucher.model';
import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';

import { ExpenseTypeService } from '../../../services/Expenses/expense-type.service';
import { PettyHolderService } from '../../../services/Expenses/petty-holder.service';
import { DepositCollectorService } from '../../../services/Expenses/deposit-collector.service';
import { UserCashCityService } from '../../../services/Expenses/user-cash-city.service';

import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-expense-voucher-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent, ReactiveFormsModule, HasPermissionDirective],
  templateUrl: './expense-voucher-list.component.html',
})
export class ExpenseVoucherListComponent implements OnInit {

  vouchers: ExpenseVoucher[] = [];
  lines: any[] = [];

  loading = true;

  cities: any[] = [];
  expenseTypes: any[] = [];
  pettyHolders: any[] = [];
  depositCollectors: any[] = [];

  resultType: number = 1;

  form = new FormGroup({
    cityIds: new FormControl([]),
    expenseTypeId: new FormControl(null),
    pettyHolderUserId: new FormControl(null),
    depositCollectorUserId: new FormControl(null),

    voucherDate: new FormControl(null),
    fromDate: new FormControl(null),
    toDate: new FormControl(null),

    approvalRole: new FormControl(null),
    isApprovedByRole: new FormControl(null),

    isAccounted: new FormControl(null),
  });

  page = 1;
  pageSize = 10;
  totalPages = 1;
  pagedData: any[] = [];

  showPopup = false;
  selected: any = null;

  showExactDate = false;
  showBetweenDates = false;
  showDepositCollector = false;
  showExpenseType = false;
  showPettyHolder = false;
  showApproval = false;
  showAccounting = false;

  approvalNoteVisible = false;

  currentUserRole: number = 0;

  constructor(
    private service: ExpenseVoucherService,
    private expenseTypeService: ExpenseTypeService,
    private pettyHolderService: PettyHolderService,
    private depositCollectorService: DepositCollectorService,
    private userCashCityService: UserCashCityService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.auth.getUserRole();
    this.loadFilterData();
    this.loadData();
  }

  loadFilterData() {
    this.userCashCityService.getCities().subscribe({
      next: res => {
        this.cities = Array.isArray(res) ? res : (res?.cities ?? res?.data ?? res?.result ?? []);
      },
      error: () => this.cities = []
    });

    this.expenseTypeService.getAll(true).subscribe({
      next: res => this.expenseTypes = Array.isArray(res) ? res : [],
      error: () => this.expenseTypes = []
    });

    this.pettyHolderService.getAll().subscribe({
      next: res => this.pettyHolders = Array.isArray(res) ? res : [],
      error: () => this.pettyHolders = []
    });

    this.depositCollectorService.getAll(true).subscribe({
      next: (res: any) => {
        this.depositCollectors = Array.isArray(res) ? res : [];
      },
      error: () => this.depositCollectors = []
    });
  }

  buildFilterDto() {

    const selectedCollector = this.depositCollectors.find(
      x => x.id === this.form.value.depositCollectorUserId
    );

    const selectedPettyHolder = this.pettyHolders.find(
      x => x.id === this.form.value.pettyHolderUserId
    );

    return {
      cityIds: this.form.value.cityIds,
      expenseTypeId: this.form.value.expenseTypeId,

      pettyHolderUserId: selectedPettyHolder?.id?.toString() ?? null,
      depositCollectorUserId: selectedCollector?.userId ?? null,

      voucherDate: this.form.value.voucherDate,
      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate,

      approvalRole: this.form.value.approvalRole,
      isApprovedByRole: this.form.value.isApprovedByRole,

      isAccounted: this.form.value.isAccounted,

      resultType: Number(this.resultType)
    };
  }

  loadVoucherHeader(voucherId: number, line: any) {
    this.service.getById(voucherId).subscribe({
      next: (header: any) => {
        line.voucherNumber = header?.voucherNumber ?? null;
        line.voucherDate = header?.voucherDate ?? null;
        line.branchName = header?.branch?.branchName ?? null;
        line.pettyHolderName = header?.pettyHolder?.name ?? null;
      }
    });
  }

  loadData() {
    this.loading = true;
    const filterDto = this.buildFilterDto();

    this.service.filter(filterDto).subscribe({
      next: (res: any) => {

        if (this.resultType == 1) {
          this.vouchers = Array.isArray(res) ? res : [];
          this.lines = [];
        } else {
          this.lines = Array.isArray(res) ? res : [];
          this.vouchers = [];

          this.lines.forEach(line => {
            this.loadVoucherHeader(line.expenseVoucherId, line);
          });
        }

        this.page = 1;
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.vouchers = [];
        this.lines = [];
        this.pagedData = [];
        this.loading = false;
      }
    });
  }

  onResultTypeChange() {
    this.page = 1;
    this.loadData();
  }

  updatePagination() {
    const sourceData = this.resultType == 1 ? this.vouchers : this.lines;

    this.totalPages = Math.ceil(sourceData.length / this.pageSize) || 1;

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedData = sourceData.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePagination();
    }
  }

  openDetails(v: any) {
    this.selected = v;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selected = null;
  }

  editVoucher(id: number) {
    this.router.navigate(['/cash-management/expenses/expense-voucher/edit', id]);
  }

  approveVoucher(id: number) {
    this.router.navigate(['/cash-management/expenses/expense-voucher/approve', id]);
  }

  approveVoucherFromLine(voucherId: number) {
    this.router.navigate(['/cash-management/expenses/expense-voucher/approve', voucherId]);
  }

  createNew() {
    this.router.navigate(['/cash-management/expenses/expense-voucher/create']);
  }

  onApprovalToggle() {
    if (this.showApproval) {
      this.approvalNoteVisible = true;
      setTimeout(() => {
        this.approvalNoteVisible = false;
      }, 30000);
    }
  }

  toggleExactDate() {
    if (!this.showExactDate) {
      this.form.controls['voucherDate'].reset();
    }
    this.showBetweenDates = false;
  }

  toggleBetweenDates() {
    if (!this.showBetweenDates) {
      this.form.controls['fromDate'].reset();
      this.form.controls['toDate'].reset();
    }
    this.showExactDate = false;
  }

  toggleDepositCollector() {
    if (!this.showDepositCollector) {
      this.form.controls['depositCollectorUserId'].reset();
    }
  }

  toggleExpenseType() {
    if (!this.showExpenseType) {
      this.form.controls['expenseTypeId'].reset();
    }
  }

  togglePettyHolder() {
    if (!this.showPettyHolder) {
      this.form.controls['pettyHolderUserId'].reset();
    }
  }

  toggleApproval() {
    if (!this.showApproval) {
      this.form.controls['approvalRole'].reset();
      this.form.controls['isApprovedByRole'].reset();
    } else {
      this.approvalNoteVisible = true;
      setTimeout(() => this.approvalNoteVisible = false, 30000);
    }
  }

  toggleAccounting() {
    if (!this.showAccounting) {
      this.form.controls['isAccounted'].reset();
    }
  }

  // ⭐ NEW — دالة تحديد صلاحية الاعتماد
  canApprove(voucher: any): boolean {
    if (!this.currentUserRole) return false;

    const requiredRole = voucher?.approvalRole;

    return requiredRole === this.currentUserRole;
  }

}
