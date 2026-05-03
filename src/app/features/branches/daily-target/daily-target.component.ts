import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


import { Router } from '@angular/router';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { AuthService } from '../../../services/auth.service';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';


@Component({
  selector: 'app-daily-target',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './daily-target.component.html',
  styleUrls: ['./daily-target.component.scss']
})

export class DailyTargetComponent implements OnInit {

  form!: FormGroup;
  currentTargetId: number | null = null;

  employees: any[] = [];
  employeeOptions: { id: number; name: string }[] = [];
  branches: any[] = [];
  branchOptions: { id: number; name: string }[] = [];
  shifts = [
    { id: 1, name: 'فترة صباحيه' },
    { id: 2, name: 'فترة بعد الظهر' },
    { id: 3, name: 'فترة بعد العصر' },
    { id: 4, name: 'فترة مساءا' },

  ];

  branchNameDisplay = '';
  userInfo: any;

  constructor(
    private fb: FormBuilder,
    private targetService: BranchDailyTargetService,
    private master: MasterDataService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    this.initHeaderFromUser();
  }

  buildForm() {
    this.form = this.fb.group({
      branchId: [null, Validators.required],
      targetDate: [new Date().toISOString().substring(0, 10), Validators.required],

      totalBranchTarget: [0, [Validators.required, Validators.min(0)]],
      totalAchieved: [0, [Validators.required, Validators.min(0)]],

      details: this.fb.array([])
    });
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  loadLookups() {
    this.master.getEmployees().subscribe(res => {
      this.employees = res.data;
      this.employeeOptions = this.employees.map((e: any) => ({
        id: e.id,
        name: e.fullName
      }));
    });
    this.master.getBranches().subscribe(res => {
  this.branches = res.data;
  this.branchOptions = this.branches.map((b: any) => ({
    id: b.id,
    name: b.branchName
  }));
});
  }

  initHeaderFromUser() {
    this.userInfo = this.auth.getUserInfo();
    const user = this.userInfo;

    if (!user || !user.branchId) return;

    this.form.get('branchId')?.setValue(user.branchId);
    this.branchNameDisplay = decodeURIComponent(escape(String(user.branchName || '')));

    this.form.get('branchId')?.disable({ emitEvent: false });
  }
loadTodayTarget() {
  // لو لسه معرفناش الفرع من اليوزر، نخرج
  if (!this.userInfo || !this.userInfo.branchId) {
    return;
  }

  const branchId = this.userInfo.branchId;
  const today = this.form.get('targetDate')?.value; // نفس التاريخ اللي في الفورم

  // هنا عندك اختيارين:
  // 1) تستخدم today-target/{branchId}
  // 2) أو تستخدم by-branch-date مع التاريخ
  // هنمشي على today-target الأول

  this.targetService.getTodayTarget(branchId).subscribe({
    next: (res) => {
      if (!res) {
        return;
      }

      // لو الـ API بيرجع نفس شكل BranchDailyTargetHeaderDto
      this.currentTargetId = res.id;

      this.form.patchValue({
        targetDate: res.targetDate?.substring(0, 10),
        totalBranchTarget: res.totalBranchTarget ?? 0,
        totalAchieved: res.totalAchieved ?? 0
      });

      // نفرّغ التفاصيل القديمة
      this.details.clear();

      if (res.details && Array.isArray(res.details)) {
        res.details.forEach((d: any) => {
          const row = this.fb.group({
            employeeId: [d.employeeId, Validators.required],
            shift: [d.shift, Validators.required],
            employeeTarget: [d.employeeTarget ?? 0, [Validators.required, Validators.min(0)]],
            employeeAchieved: [d.employeeAchieved ?? 0, [Validators.required, Validators.min(0)]]
          });

          this.details.push(row);
        });
      }
    },
    error: (err) => {
      console.error('Error loading today target', err);
    }
  });
}

  addDetail() {
    const row = this.fb.group({
      employeeId: [null, Validators.required],
      shift: [1, Validators.required],
      employeeTarget: [0, [Validators.required, Validators.min(0)]],
      employeeAchieved: [0, [Validators.required, Validators.min(0)]]
    });

    this.details.push(row);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
  }

save() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    alert('من فضلك أكمل جميع الحقول المطلوبة');
    return;
  }

  const raw = this.form.getRawValue();

  const payload = {
    branchId: this.userInfo.branchId,
    targetDate: raw.targetDate,
    totalBranchTarget: raw.totalBranchTarget,
    totalAchieved: raw.totalAchieved,
    details: raw.details // ده مطابق لـ BranchDailyTargetDetailCreateUpdateDto
  };

  // لو فيه تارجت قديم → نعمل update
  if (this.currentTargetId) {
    this.targetService.update(this.currentTargetId, payload).subscribe({
      next: () => {
        alert('تم تحديث التارجت بنجاح');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('حدث خطأ أثناء التحديث');
      }
    });
  } else {
    // مفيش تارجت قبل كده → نعمل create
    this.targetService.create(payload).subscribe({
      next: () => {
        alert('تم حفظ التارجت بنجاح');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('حدث خطأ أثناء الحفظ');
      }
    });
  }
}

  goBackToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
