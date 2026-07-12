import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { CashPostingService } from '../../services/Expenses/cash-posting.service';
import { MasterDataService } from '../../services/master-data.service';

import { ManualPostingRequest, ManualPostingResult } from '../../shared/models/manual-posting.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-posting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './manual-posting.component.html',
  styleUrls: ['./manual-posting.component.css']
})
export class ManualPostingComponent implements OnInit {

cashBoxName: string = '';
cashBoxId: number | null = null;

  form!: FormGroup;

  branches: any[] = [];

  result: ManualPostingResult | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private postingService: CashPostingService,
    private masterData: MasterDataService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
  
    this.buildForm();
    this.loadBranches();
      this.loadCashBox(); // 🔥 نجيب الصندوق أول ما الصفحة تفتح
  }

  private getToday(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  buildForm() {
    this.form = this.fb.group({
      branchId: [null],
      date: [this.getToday()],
      postedAmount: [0],
      actualAmount: [0],   // 🔥 لازم تكون دي
      notes: ['']
    });
  }

  loadBranches() {
    this.masterData.getBranches().subscribe(res => {
      this.branches = res.success ? res.data : [];
    });
  }

onBranchOrDateChange() {
  const branchId = this.form.get('branchId')?.value;
  const date = this.form.get('date')?.value;

  if (!branchId || !date) return;

  this.postingService.getPostedAmount(branchId, date).subscribe((amount: number) => {
    if (!amount || amount <= 0) {
      this.form.patchValue({ postedAmount: 0 });
      this.toast.show(
        'هذا الفرع لم يُدخل يومية في هذا التاريخ، من فضلك أدخل النقدية الفعلية المستلمة.',
        'error'
      );
      return;
    }

    this.form.patchValue({ postedAmount: amount });
  });
}

submit() {

  if (this.form.invalid) return;

  this.loading = true;
  this.result = null;

  const body: ManualPostingRequest = {
    branchId: this.form.value.branchId,
    cashBoxId: this.cashBoxId!,
    date: this.form.value.date,
    postedAmount: Number(this.form.value.postedAmount ?? 0),
    actualAmount: Number(this.form.value.actualAmount ?? 0),
    notes: this.form.value.notes
  };

  // 🔥 لو مفيش يومية + مفيش نقدية فعلية → ممنوع
  if (body.postedAmount <= 0 && body.actualAmount <= 0) {
    this.toast.show(
      'هذا الفرع لم يُدخل يومية في هذا التاريخ، من فضلك أدخل النقدية الفعلية المستلمة.',
      'error'
    );
    this.loading = false;
    return;
  }

  // 🔥 النقدية الفعلية لازم تكون رقم موجب
  if ((Number(body.actualAmount ?? 0)) <= 0) {
    this.toast.show(
      'من فضلك أدخل النقدية الفعلية المستلمة (قيمة موجبة فقط).',
      'error'
    );
    this.loading = false;
    return;
  }

  this.postingService.manualPost(body).subscribe({
    next: (res) => {
      this.loading = false;
      this.result = res;

      if (res.success) {
        this.toast.show('تم الترحيل بنجاح.', 'success');

        setTimeout(() => {
          this.router.navigate(['/cash-management']);
        }, 1500);
      }
      else {
        this.toast.show('لم يتم الترحيل، تأكد من البيانات.', 'error');
      }
    },
    error: (err) => {
      this.loading = false;
      this.toast.show('حدث خطأ أثناء الاتصال بالخادم.', 'error');
      console.error(err);
    }
  });
}



    loadCashBox() {

      const userId = this.auth.getUserId();

      console.log("UserId =", userId);

      if (!userId) {
        console.error("UserId is null");
        return;
      }

      this.postingService.getMyCashBox(userId).subscribe({

        next: res => {

          console.log("CashBox =", res);

          this.cashBoxName = res.cashBoxName;
          this.cashBoxId = res.cashBoxId;

        },

        error: err => {

          console.error(err);

        }

      });

    }

    onActualAmountChange() {
      const value = Number(this.form.value.actualAmount);

      // لو القيمة مش رقم أو أقل من أو يساوي صفر
      if (isNaN(value) || value <= 0) {
        this.form.patchValue({ actualAmount: null });

        this.toast.show(
          'القيمة يجب أن تكون رقمًا موجبًا فقط.',
          'error'
        );
      }
    }
    preventNegative(event: KeyboardEvent) {
      if (event.key === '-' || event.key === '+') {
        event.preventDefault();
      }
    }

    goBackToMain() {
  // لو عندك Routing جاهز
  this.router.navigate(['/cash-management']); // غيّر المسار حسب شاشتك

  // لو الشاشة مفتوحة كـ Popup أو Drawer
  // this.close();  // لو عندك دالة إغلاق
}
}
