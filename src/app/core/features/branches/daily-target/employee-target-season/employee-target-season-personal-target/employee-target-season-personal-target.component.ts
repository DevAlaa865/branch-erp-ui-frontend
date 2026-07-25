import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EmployeeShiftTargetSeasonHeaderService } from '../../../../../../services/employee-shift-target-season-header.service';
import { MasterDataService } from '../../../../../../services/master-data.service';
import { CustomSelectComponent } from '../../../../../../shared/custom-select/custom-select.component';
import { EmployeePersonalTargetSeasonService } from '../../../../../../services/employee-personal-target-season.service';
import { ToastService } from '../../../../../../shared/toast.service';

@Component({
  selector: 'app-employee-target-season-personal-target',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomSelectComponent
  ],
  templateUrl: './employee-target-season-personal-target.component.html',
  styleUrls: ['./employee-target-season-personal-target.component.css']
})
export class EmployeeTargetSeasonPersonalTargetComponent implements OnInit {

  form!: FormGroup;

  header: any = null;
  employees: any[] = [];
  personalTargetAmount: number = 0;

  shiftType: number | null = null;

  constructor(
    private fb: FormBuilder,
    private personalTargetService: EmployeePersonalTargetSeasonService,
    private headerService: EmployeeShiftTargetSeasonHeaderService,
    private masterDataService: MasterDataService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeId: [null, Validators.required]
    });

    this.loadEmployees();
  }

  loadEmployees() {
    this.masterDataService.getEmployees().subscribe({
      next: (res: any) => this.employees = res.data,
      error: (err: any) => console.error(err)
    });
  }

  // ⭐ Toast احترافي لأسماء الموظفات
  showShiftFullToast(employees: any[]) {
    const names = employees.map(e => e.employeeName).join(' - ');
    this.toast.show(
      `تم تسجيل التارجت لهذا الشيفت بالفعل للموظفات: ${names}`,
      'error'
    );
  }

  // ⭐ دالة موحدة للتشييك + التحويل
  checkAndRedirectIfFull(headerId: number) {
    this.personalTargetService.checkShift(headerId).subscribe({
      next: () => {},
      error: (err) => {
        if (err.error?.employees) {
          this.showShiftFullToast(err.error.employees);

          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      }
    });
  }

  onShiftSelect(shift: number) {
    this.shiftType = shift;

    const rawToken = localStorage.getItem('token');
    if (!rawToken) {
      this.toast.show("لم يتم العثور على بيانات الفرع، برجاء تسجيل الدخول مرة أخرى", 'error');
      return;
    }

    const token = JSON.parse(atob(rawToken.split('.')[1]));
    const branchId = token.branchId;

    const today = new Date().toISOString().split('T')[0];

    this.headerService.getHeaders().subscribe({
      next: (res: any[]) => {
        this.header = res.find(h =>
          h.branchId === branchId &&
          h.shiftType === shift &&
          h.targetDate.split('T')[0] === today
        );

        if (!this.header) {
          this.toast.show("لم يتم إرسال تارجت هذا الشيفت حتى الآن", 'error');
          return;
        }

        // ⭐ تشيك أول ما يختار الشيفت
        this.checkAndRedirectIfFull(this.header.id);
      }
    });
  }

selectEmployee(empId: number) {
  if (!this.header || !empId) return;

  // ⭐ احسب التارجت الشخصي فورًا
  this.personalTargetAmount =
    this.header.totalShiftTargetAmount / this.header.employeesCount;

  // ⭐ بعد الحساب نعمل تشيك من الباك‑إند
  this.personalTargetService.checkShift(this.header.id).subscribe({
    next: () => {
      // الشيفت لسه مش مكتمل → التارجت يفضل ظاهر
    },
    error: (err) => {
      if (err.error?.employees) {
        this.showShiftFullToast(err.error.employees);

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    }
  });
}


save() {
  if (this.form.invalid) {
    this.toast.show("من فضلك اختر الموظفة", 'error');
    return;
  }

  const dto = {
    shiftHeaderId: this.header.id,
    employeeId: this.form.value.employeeId,
    personalTargetAmount: this.personalTargetAmount
  };

  this.personalTargetService.create(dto).subscribe({
    next: () => {
      this.toast.show("✔ تم حفظ تارجت الموظفة بنجاح", 'success');

      this.form.reset();
      this.personalTargetAmount = 0;

      this.employees = this.employees.filter(e => e.id !== dto.employeeId);

      // ⭐ بعد الحفظ نجيب عدد الموظفات اللي اتحفظوا فعليًا
      this.personalTargetService.getByHeader(this.header.id).subscribe({
        next: (savedList: any[]) => {

          const savedCount = savedList.length;
          const requiredCount = this.header.employeesCount;

          // ⭐ لو العدد اكتمل → تحويل فورًا
          if (savedCount >= requiredCount) {

            const names = savedList.map(e => e.employeeName).join(' - ');
            this.toast.show(
              `✔ تم حفظ جميع الموظفات لهذا الشيفت: ${names}`,
              'success'
            );

            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        }
      });
    },

    error: (err) => {
      if (err.error?.employees) {
        const names = err.error.employees.map((e: any) => e.employeeName).join(' - ');
        this.toast.show(
          `تم تسجيل التارجت بالفعل للموظفات: ${names}`,
          'error'
        );

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        this.toast.show("❌ حدث خطأ أثناء حفظ التارجت", 'error');
      }
    }
  });
}


}
