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
  ExpenseVoucherSource
} from '../../../shared/models/expense-voucher.model';

import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { ExpenseTypeService } from '../../../services/Expenses/expense-type.service';
import { PettyHolderService } from '../../../services/Expenses/petty-holder.service';
import { UserCashCityService } from '../../../services/Expenses/user-cash-city.service';
import { MasterDataService } from '../../../services/master-data.service';


import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-expense-voucher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './expense-voucher-form.component.html',
})
export class ExpenseVoucherFormComponent implements OnInit {

  form!: FormGroup;

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadExpenseTypes();
    this.loadPettyHolders();
    this.loadBranchesForUser();
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

  addLine() {
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
        this.branches = res || [];
      });
    } else {
      this.masterDataService.getBranches().subscribe((res: any) => {
        this.branches = res || [];
      });
    }
  }

  loadDepositSummary() {
    // Placeholder: عدّل الـ API حسب الباك إند عندك
    this.voucherService.getDepositSummary().subscribe((res: any) => {
      this.totalDeliveredToDepositResponsible = res?.totalDelivered ?? 0;
      this.totalSpentByDepositResponsible = res?.totalSpent ?? 0;
    });
  }

  isPettyExpense(lineGroup: FormGroup): boolean {
    const typeId = lineGroup.get('expenseTypeId')?.value;
    const type = this.expenseTypes.find(t => t.id === typeId);
    return !!type && !!type.isPetty;
  }

  get totalAmount(): number {
    return this.lines.controls.reduce((sum, group) => {
      const amount = (group as FormGroup).get('amount')?.value || 0;
      return sum + amount;
    }, 0);
  }

  uploadAttachment(event: any, lineGroup: FormGroup) {
    const file = event.target.files[0];
    if (!file) return;

    this.voucherService.uploadAttachment(file).subscribe({
      next: res => {
        const current = lineGroup.get('attachmentUrls')?.value || [];
        current.push(res.url);
        lineGroup.get('attachmentUrls')?.setValue(current);
      }
    });
  }

  prepareModel(submit: boolean): CreateExpenseVoucherRequest {
    const userInfo = this.auth.getUserInfo();

    const model: CreateExpenseVoucherRequest = {
      voucherDate: this.form.value.voucherDate,
      description: this.form.value.description,
      cashBoxId: this.auth.getBranchId() ?? 0,
      createdByUserId: userInfo.userName ?? '',
      cityId: userInfo.cityIds && userInfo.cityIds.length > 0 ? userInfo.cityIds[0] : null,
      branchId: userInfo.branchId ?? null,
      submit,
      source: ExpenseVoucherSource.DepositResponsible,
      lines: this.form.value.lines
    };

    return model;
  }

  save(submit: boolean) {
    const model = this.prepareModel(submit);

    this.voucherService.create(model).subscribe({
      next: () => this.router.navigate(['/cash-management/expenses/expense-voucher']),
      error: err => console.error(err)
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


}
