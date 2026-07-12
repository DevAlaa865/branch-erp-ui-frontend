import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  CreateExpenseVoucherRequest,
  ExpenseVoucherSource,
  UserType
} from '../../../shared/models/expense-voucher.model';

import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { ExpenseTypeService } from '../../../services/Expenses/expense-type.service';
import { PettyHolderService } from '../../../services/Expenses/petty-holder.service';
import { UserCashCityService } from '../../../services/Expenses/user-cash-city.service';
import { MasterDataService } from '../../../services/master-data.service';

import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { AuthService } from '../../../services/auth.service';
import { DepositCollectorService } from '../../../services/Expenses/deposit-collector.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-expense-voucher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent,HasPermissionDirective],
  templateUrl: './expense-voucher-form.component.html',
})
export class ExpenseVoucherFormComponent implements OnInit {

  form!: FormGroup;
  cashBoxId: number = 0;

  expenseTypes: any[] = [];
  branches: any[] = [];
  pettyHolders: any[] = [];

  totalDeliveredToDepositResponsible = 0;
  totalSpentByDepositResponsible = 0;

  get remainingAmount(): number {
    return this.totalDeliveredToDepositResponsible - this.totalSpentByDepositResponsible;
  }

  constructor(
    private fb: FormBuilder,
    private voucherService: ExpenseVoucherService,
    private expenseTypeService: ExpenseTypeService,
    private pettyHolderService: PettyHolderService,
    private userCashCityService: UserCashCityService,
    private masterDataService: MasterDataService,
    private auth: AuthService,
    private depositCollectorService: DepositCollectorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadExpenseTypes();
    this.loadPettyHolders();
    this.loadBranchesForUser();
    this.loadCashBoxId();
    this.loadDepositSummary();
  }

  buildForm() {
    this.form = this.fb.group({
      voucherDate: [new Date().toISOString().substring(0, 10)],
      description: [''],
      lines: this.fb.array([])
    });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  loadCashBoxId() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.depositCollectorService.getMyCashBox(userId).subscribe({
      next: res => {
        this.cashBoxId = res;
        console.log("CashBoxId =", res);
      },
      error: err => console.error(err)
    });
  }

  addLine() {

  // لو مفيش ولا سطر → نضيف أول سطر عادي
  if (this.lines.length === 0) {
    const group = this.fb.group({
      expenseTypeId: [null],
      amount: [0],
      branchId: [null],
      pettyHolderId: [null],
      description: [''],
      attachmentUrls: [[]]
    });

    this.lines.push(group);
    return;
  }

  // 🔥 فحص آخر سطر قبل الإضافة
  const lastLine = this.lines.at(this.lines.length - 1) as FormGroup;

  const expenseTypeId = lastLine.get('expenseTypeId')?.value;
  const amount = lastLine.get('amount')?.value;
  const category = this.getExpenseCategory(this.lines.length - 1);
  const pettyHolderId = lastLine.get('pettyHolderId')?.value;

  // 🔥 بند المصروف لازم يكون مختار
  if (!expenseTypeId) {
    this.showToast('من فضلك قم باختيار بند المصروف في السطر السابق أولًا', 'error');
    return;
  }

  // 🔥 المبلغ لازم يكون صحيح
  if (!amount || amount <= 0) {
    this.showToast('من فضلك قم بإدخال مبلغ صحيح في السطر السابق أولًا', 'error');
    return;
  }

  // 🔥 لو البند عهدة → لازم صاحب العهدة يكون مختار
  if (this.isPettyCategory(category) && !pettyHolderId) {
    this.showToast('من فضلك قم باختيار صاحب العهدة في السطر السابق أولًا', 'error');
    return;
  }

  // 🔥 لو كل شيء تمام → نضيف السطر الجديد
  const group = this.fb.group({
    expenseTypeId: [null],
    amount: [0],
    branchId: [null],
    pettyHolderId: [null],
    description: [''],
    attachmentUrls: [[]]
  });

  this.lines.push(group);
}


  loadExpenseTypes() {
    this.expenseTypeService.getAll(true).subscribe(res => {
      this.expenseTypes = res || [];
    });
  }

  loadPettyHolders() {
    this.pettyHolderService.getAll().subscribe(res => {
      this.pettyHolders = res || [];
    });
  }

  loadBranchesForUser() {
    const cityIds = this.auth.getCityIds();

    if (cityIds && cityIds.length > 0) {
      this.masterDataService.getBranchesByCities(cityIds).subscribe((res: any) => {
        this.branches = res.data || [];
      });
    } else {
      this.masterDataService.getBranches().subscribe((res: any) => {
        this.branches = res.data || [];
      });
    }
  }

  loadDepositSummary() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.voucherService.getDepositSummary(userId).subscribe(res => {
      this.totalDeliveredToDepositResponsible = res.totalDelivered;
      this.totalSpentByDepositResponsible = res.totalSpent;
    });
  }

  // ============================================================
  // 🔥 منطق العهدة (Petty) — رجعناه زي ما كان
  // ============================================================
  getExpenseCategory(index: number): number {
    const line = this.lines.at(index) as FormGroup;
    const typeId = line.get('expenseTypeId')?.value;

    const type = this.expenseTypes.find(t => t.id === typeId);
    return type ? type.category : 0;
  }

  isPettyCategory(categoryId: number): boolean {
    return categoryId === 5 || categoryId === 6;
  }
    get totalAmount(): number {
      return this.lines.controls.reduce((sum, group) => {
        const amount = (group as FormGroup).get('amount')?.value || 0;
        return sum + amount;
      }, 0);
    }
  // ============================================================
  // 🔥 الفاليديشن قبل الحفظ
  // ============================================================
validateBeforeSave(): boolean {

  if (this.lines.length === 0) {
    this.showToast('يجب إضافة بند واحد على الأقل', 'error');
    return false;
  }

  for (let i = 0; i < this.lines.length; i++) {

    const fg = this.lines.at(i) as FormGroup;
    const amount = fg.get('amount')?.value;
    const expenseTypeId = fg.get('expenseTypeId')?.value;

    // 🔥 بند المصروف لازم يكون مختار
    if (!expenseTypeId) {
      this.showToast('يجب اختيار البند في جميع السطور', 'error');
      return false;
    }

    // 🔥 المبلغ غير موجود أو صفر
    if (!amount) {
      this.showToast('يجب إدخال مبلغ صحيح في جميع السطور', 'error');
      return false;
    }

    // 🔥 المبلغ بالسالب
    if (amount < 0) {
      this.showToast('رجاء إدخال المبلغ بالقيمة الموجبة', 'error');
      return false;
    }

    // 🔥 المبلغ صفر أو أقل
    if (amount <= 0) {
      this.showToast('يجب إدخال مبلغ صحيح في جميع السطور', 'error');
      return false;
    }

    // ============================================================
    // 🔥 الشرط الجديد: لو البند عهدة → لازم صاحب العهدة يكون مختار
    // ============================================================

    const category = this.getExpenseCategory(i);

    if (this.isPettyCategory(category)) {

      const pettyHolderId = fg.get('pettyHolderId')?.value;

      if (!pettyHolderId) {
        this.showToast('يجب اختيار صاحب العهدة عند اختيار بند عهدة', 'error');
        return false;
      }
    }
  }

  return true;
}


  prepareModel(submit: boolean): CreateExpenseVoucherRequest {
    const userInfo = this.auth.getUserInfo();
    const userId = this.auth.getUserId();
    const userType = this.auth.getUserType();

    let source = ExpenseVoucherSource.DepositCollector;
    if (userType === UserType.PettyHolder) {
      source = ExpenseVoucherSource.PettySettlement;
    }

    return {
      voucherDate: this.form.value.voucherDate,
      description: this.form.value.description,
      cashBoxId: this.cashBoxId,
      createdByUserId: userId ?? '',
      cityId: userInfo.cityIds?.length ? userInfo.cityIds[0] : null,
      branchId: userInfo.branchId ?? null,
      submit,
      source,
      lines: this.form.value.lines
    };
  }

save(submit: boolean) {

  if (!this.cashBoxId) {
    this.showToast('لم يتم تحميل الصندوق الخاص بالمستخدم', 'error');
    return;
  }

  if (!this.validateBeforeSave()) return;

  const model = this.prepareModel(submit);

  this.voucherService.create(model).subscribe({
    next: () => {
      this.showToast('تم حفظ سند الصرف بنجاح', 'success');

      // 🔥 الحل النهائي لمشكلة الموبايل + عدم الانتقال
      setTimeout(() => {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/cash-management/expenses/expense-voucher/create']);
        });
      }, 500);
    },
    error: err => {
      console.error(err);
      this.showToast('حدث خطأ أثناء الحفظ', 'error');
    }
  });
}


  getFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  getLineGroups(): FormGroup[] {
    return this.lines.controls as FormGroup[];
  }

  getAttachmentUrls(group: FormGroup): string[] {
    return group.get('attachmentUrls')?.value || [];
  }
uploadAttachment(event: any, lineGroup: FormGroup) {
  const file = event.target.files[0];
  if (!file) return;

  this.voucherService.uploadAttachment(file).subscribe({
    next: res => {
      const current = lineGroup.get('attachmentUrls')?.value || [];
      current.push(res.url);
      lineGroup.get('attachmentUrls')?.setValue(current);
    },
    error: err => {
      console.error(err);
      this.showToast('حدث خطأ أثناء رفع المرفق', 'error');
    }
  });
}

  // ============================================================
  // 🔥 Toast احترافي ريسبونسيف
  // ============================================================
  showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.innerText = message;

    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '9999';
    toast.style.padding = '14px 22px';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '15px';
    toast.style.fontWeight = '600';
    toast.style.maxWidth = '90%';
    toast.style.textAlign = 'center';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    toast.style.background = type === 'success' ? '#16a34a' : '#dc2626';
    toast.style.color = 'white';

    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}
