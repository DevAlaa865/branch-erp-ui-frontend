import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  BranchDailyTargetSeasonDto,
  BranchDailyTargetSeasonUpdateDto
} from '../../../../../shared/models/branch-daily-target-season.model';

import { BranchDailyTargetSeasonService } from '../../../../../services/branch-daily-target.service';
import { AuthService } from '../../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-daily-target-season',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './daily-target-season.component.html',
  styleUrls: ['./daily-target-season.component.css']
})
export class DailyTargetSeasonComponent implements OnInit {

 data: BranchDailyTargetSeasonDto = {
  id: 0,
  branchId: 0,
  branchName: '',
  targetDate: '',
  dailyTargetAmount: 0,
  achievedAmount: 0,
  achievedPercentage: 0,
  notes: ''
};
isAchievedLocked = false;
showToast = false;
toastMessage = '';
  message = '';

  showMessage = false;

  branchName = '';

  selectedDate = '';

  loading = false;

  hasTarget = false;

  constructor(
    private targetService: BranchDailyTargetSeasonService,
    private authService: AuthService,
     private router: Router
  ) { }

  ngOnInit(): void {
// تاريخ اليوم

    // اسم الفرع من التوكن
    this.branchName = this.authService.getBranchName() ?? '';

    // إصلاح مشكلة ظهور العربية بشكل مشفر
    try {
      this.branchName = decodeURIComponent(escape(this.branchName));
    } catch {
      // لو الاسم أصلاً سليم نسيبه
    }

    // تاريخ اليوم
    this.selectedDate = new Date().toISOString().split('T')[0];

    // تحميل بيانات التارجت
    this.loadDailyTarget();

  }
  // =======================================================
// تحميل بيانات التارجت حسب التاريخ
// =======================================================

loadDailyTarget(): void {

  this.loading = true;

  const branchId = this.authService.getBranchId() ?? 0;

  this.targetService.getDailyTarget(branchId, this.selectedDate)
    .subscribe({

      next: (res: BranchDailyTargetSeasonDto | null) => {

        this.loading = false;

        this.showMessage = false;

        // ⭐ الحل الحقيقي هنا
        if (res && res.id > 0) {

          this.data = res;
          this.hasTarget = true;

          // ⭐ لو المتحقق أكبر من صفر يبقى الحقل مقفول
          this.isAchievedLocked = Number(this.data.achievedAmount) > 0;

        } else {

          this.createEmptyData();
          this.hasTarget = false;

          this.isAchievedLocked = false;

          this.showTempMessage("لا يوجد تارجت لهذا اليوم");
        }

      },

      error: (err) => {

        console.error(err);

        this.loading = false;

        this.showMessage = false;

        this.createEmptyData();
        this.hasTarget = false;

        this.isAchievedLocked = false;

        this.showTempMessage("حدث خطأ أثناء تحميل البيانات");
      }

    });

}




// =======================================================
// عند تغيير التاريخ
// =======================================================

onDateChange(): void {

  this.loadDailyTarget();

}
// =======================================================
// إنشاء بيانات فارغة فى حالة عدم وجود تارجت
// =======================================================

createEmptyData(): void {

  this.data = {

    id: 0,

    branchId: this.authService.getBranchId() ?? 0,

    branchName: this.branchName,

    targetDate: this.selectedDate,

    dailyTargetAmount: 0,

    achievedAmount: 0,

    achievedPercentage: 0,

    notes: ''

  };

}

// =======================================================
// حساب نسبة الإنجاز
// =======================================================

calcPercentage(): number {

  if (!this.data)
    return 0;

  if (!this.data.dailyTargetAmount)
    return 0;

  const achieved = this.data.achievedAmount ?? 0;

  return (achieved / this.data.dailyTargetAmount) * 100;

}

// =======================================================
// لون شريط التقدم
// =======================================================

get progressColor(): string {

  const percentage = this.calcPercentage();

  if (percentage >= 100)
    return '#16a34a'; // أخضر

  if (percentage >= 70)
    return '#2563eb'; // أزرق

  if (percentage >= 40)
    return '#f59e0b'; // برتقالي

  return '#dc2626'; // أحمر

}

// =======================================================
// عرض شريط التقدم
// =======================================================

getProgressWidth(): number {

  const percentage = this.calcPercentage();

  if (percentage <= 0)
    return 0;

  if (percentage >= 100)
    return 100;

  return percentage;

}
// =======================================================
// حفظ البيانات
// =======================================================

save(): void {

  if (!this.hasTarget) {
    this.showToastMessage("لا يوجد تارجت لهذا اليوم، لا يمكن الحفظ.");
    return;
  }

  this.loading = true;

  const dto: BranchDailyTargetSeasonUpdateDto = {
    id: this.data.id,
    achievedAmount: this.data.achievedAmount ?? 0,
    notes: this.data.notes
  };

  this.targetService.updateTarget(dto).subscribe({
    next: () => {
      this.loading = false;

      // إعادة تحميل البيانات لإظهار النسبة الجديدة
      this.loadDailyTarget();

      // Toast + رجوع للداشبورد
      this.showToastMessage("✔ تم حفظ المتحقق بنجاح", true);
    },

    error: (err) => {
      console.error(err);
      this.loading = false;

      this.showToastMessage("❌ حدث خطأ أثناء الحفظ");
    }
  });
}


// =======================================================
// رسائل النظام
// =======================================================

showTempMessage(message: string): void {

  this.message = message;

  this.showMessage = true;

  clearTimeout((this as any)._msgTimer);

  (this as any)._msgTimer = setTimeout(() => {

    this.showMessage = false;

  }, 10000);

}
showToastMessage(msg: string, redirect: boolean = false) {
  this.toastMessage = msg;
  this.showToast = true;

  setTimeout(() => {
    this.showToast = false;

    if (redirect) {
      // الرجوع للداشبورد
      this.router.navigate(['/dashboard']);
    }

  }, 2000); // يظهر لمدة ثانيتين
}

}