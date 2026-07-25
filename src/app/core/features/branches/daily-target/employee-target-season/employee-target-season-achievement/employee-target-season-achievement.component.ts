import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { EmployeePersonalAchievementSeasonService } from '../../../../../../services/employee-personal-achievement-season.service';
import { EmployeePersonalTargetSeasonService } from '../../../../../../services/employee-personal-target-season.service';
import { EmployeeShiftTargetSeasonHeaderService } from '../../../../../../services/employee-shift-target-season-header.service';

import { CustomSelectComponent } from '../../../../../../shared/custom-select/custom-select.component';
import { ToastService } from '../../../../../../shared/toast.service';

@Component({
  selector: 'app-employee-target-season-achievement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomSelectComponent
  ],
  templateUrl: './employee-target-season-achievement.component.html',
  styleUrls: ['./employee-target-season-achievement.component.css']
})
export class EmployeeTargetSeasonAchievementComponent implements OnInit {

  form!: FormGroup;

  header: any = null;

  shiftType: number | null = null;

  personalTargets: any[] = [];

  selectedTarget: any = null;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private achievementService: EmployeePersonalAchievementSeasonService,
    private personalTargetService: EmployeePersonalTargetSeasonService,
    private headerService: EmployeeShiftTargetSeasonHeaderService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({

      employeePersonalTargetId: [
        null,
        Validators.required
      ],

      achievedAmount: [
        null,
        Validators.required
      ],

      isOverrideCommission: [false],

      overrideCommissionReason: ['']

    });

  }

  //==========================
  // اختيار الشيفت
  //==========================

  onShiftSelect(shift: number) {

    this.shiftType = shift;

    this.selectedTarget = null;

    this.personalTargets = [];

    this.form.patchValue({
      employeePersonalTargetId: null,
      achievedAmount: null
    });

    const rawToken = localStorage.getItem('token');

    if (!rawToken) {

      this.toast.show(
        'لم يتم العثور على بيانات الفرع',
        'error'
      );

      return;
    }

    const token = JSON.parse(
      atob(rawToken.split('.')[1])
    );

    const branchId = token.branchId;

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    this.loading = true;

    this.headerService.getHeaders().subscribe({

      next: (headers: any[]) => {

        this.header = headers.find(h =>

          h.branchId == branchId &&

          h.shiftType == shift &&

          h.targetDate.split('T')[0] == today

        );

        if (!this.header) {

          this.loading = false;

          this.toast.show(
            'لم يتم إرسال تارجت لهذا الشيفت',
            'error'
          );

          return;
        }

        this.loadEmployees();
      },

      error: () => {

        this.loading = false;

        this.toast.show(
          'حدث خطأ أثناء تحميل الشيفت',
          'error'
        );

      }

    });

  }

  //==========================
  // تحميل الموظفات
  //==========================

  loadEmployees() {

    this.personalTargetService
      .getByHeader(this.header.id)
      .subscribe({

        next: (res: any[]) => {

          this.personalTargets = res;

          this.loading = false;

        },

        error: () => {

          this.loading = false;

          this.toast.show(
            'حدث خطأ أثناء تحميل الموظفات',
            'error'
          );

        }

      });

  }
    //==========================
  // اختيار الموظفة
  //==========================

  onSelectTarget(targetId: number) {

    this.selectedTarget =
      this.personalTargets.find(x => x.id == targetId);

    if (!this.selectedTarget) {

      this.toast.show(
        'لم يتم العثور على بيانات الموظفة',
        'error'
      );

      return;
    }

  }

  //==========================
  // حفظ المتحقق
  //==========================

  save() {

    if (!this.header) {

      this.toast.show(
        'اختر الشيفت أولاً',
        'error'
      );

      return;
    }

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.toast.show(
        'من فضلك أكمل البيانات',
        'error'
      );

      return;
    }

    const dto = {

      employeePersonalTargetId:
        this.form.value.employeePersonalTargetId,

      achievedAmount:
        this.form.value.achievedAmount

    };

    this.achievementService.create(dto).subscribe({

      next: () => {

        this.toast.show(
          '✔ تم حفظ المتحقق بنجاح',
          'success'
        );

        this.form.patchValue({

          employeePersonalTargetId: null,

          achievedAmount: null,

          isOverrideCommission: false,

          overrideCommissionReason: ''

        });

        this.selectedTarget = null;

        this.loadEmployees();

      },

      error: (err) => {

        console.log(err);

        this.toast.show(
          '❌ حدث خطأ أثناء حفظ المتحقق',
          'error'
        );

      }

    });

  }

}