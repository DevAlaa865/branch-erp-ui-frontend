import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { AuthService } from '../../../services/auth.service';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';
import Swal from 'sweetalert2';

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
  viewMode = false;

  employees: any[] = [];
  employeeOptions: any[] = [];
  branches: any[] = [];
  branchOptions: any[] = [];

  isEditMode = false;
  isViewMode = false; 

  shifts = [
    { id: 1, name: 'فترة صباحيه' },
    { id: 2, name: 'فترة بعد الظهر' },
    { id: 3, name: 'فترة بعد العصر' },
    { id: 4, name: 'فترة مساءا' },
  ];

  userInfo: any;

  constructor(
    private fb: FormBuilder,
    private targetService: BranchDailyTargetService,
    private master: MasterDataService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();

    this.route.queryParams.subscribe(params => {
      const idParam = params['id'];
      const viewParam = params['view'];

      if (idParam) {
        this.currentTargetId = Number(idParam);
        this.viewMode = viewParam === 'true';
        this.loadTargetById(this.currentTargetId);
      } else {
        this.initHeaderFromUser();
        this.setupAutoLoadTodayTarget();
      }
    });
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
    this.form.get('branchId')?.disable({ emitEvent: false });
  }

  setupAutoLoadTodayTarget(): void {
    if (this.currentTargetId) return;

    this.form.get('branchId')?.valueChanges.subscribe(branchId => {
      if (branchId) this.loadTodayTarget();
    });

    this.form.get('targetDate')?.valueChanges.subscribe(() => {
      this.loadTodayTarget();
    });
  }

  loadTodayTarget() {
    if (this.viewMode || this.currentTargetId) return;

    const branchId = this.form.get('branchId')?.value;
    const today = this.form.get('targetDate')?.value;

    if (!branchId || !today) return;

    this.targetService.getByBranchAndDate(branchId, today).subscribe({
      next: (res) => {
        if (!res || !res.data || res.data.length === 0) {
          this.details.clear();
          this.form.patchValue({
            totalBranchTarget: 0,
            totalAchieved: 0
          });
          return;
        }

        const target = res.data[0];

        this.form.patchValue({
          totalBranchTarget: target.totalBranchTarget,
          totalAchieved: target.totalAchieved
        });

        this.details.clear();
        target.details.forEach((d: any) => {
          this.details.push(this.fb.group({
            employeeId: [d.employeeId, Validators.required],
            shift: [d.shift, Validators.required],
            employeeTarget: [d.employeeTarget, Validators.required],
            employeeAchieved: [d.employeeAchieved, Validators.required]
          }));
        });
      }
    });
  }

  loadTargetById(id: number): void {
    this.targetService.getById(id).subscribe({
      next: (res: any) => {
        const data = res.data;
        if (!data) return;

        this.form.patchValue({
          branchId: data.branchId,
          targetDate: data.targetDate.substring(0, 10),
          totalBranchTarget: data.totalBranchTarget,
          totalAchieved: data.totalAchieved
        });

        this.details.clear();
        data.details.forEach((d: any) => {
          this.details.push(this.fb.group({
            employeeId: [d.employeeId, Validators.required],
            shift: [d.shift, Validators.required],
            employeeTarget: [d.employeeTarget, Validators.required],
            employeeAchieved: [d.employeeAchieved, Validators.required]
          }));
        });
      this.isEditMode = !this.viewMode;
      this.isViewMode = this.viewMode;

        this.applyModeLocking();
      }
    });
  }

  addDetail() {
    this.details.push(this.fb.group({
      employeeId: [null, Validators.required],
      shift: [1, Validators.required],
      employeeTarget: [0, [Validators.required, Validators.min(0)]],
      employeeAchieved: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'من فضلك أكمل جميع الحقول المطلوبة',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      branchId: raw.branchId,
      targetDate: raw.targetDate,
      totalBranchTarget: raw.totalBranchTarget,
      totalAchieved: raw.totalAchieved,
      details: raw.details
    };

    if (this.currentTargetId) {
      this.targetService.update(this.currentTargetId, payload).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'تم تحديث التارجت بنجاح',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });

          this.router.navigate(['/branch-targets']);
        }
      });
      return;
    }

    this.targetService.create(payload).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم حفظ التارجت بنجاح',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        this.router.navigate(['/branch-targets']);
      }
    });
  }

  goBackToDashboard() {
    this.router.navigate(['/dashboard']);
  }

applyModeLocking() {
  if (this.viewMode) {
    this.form.disable();
    return;
  }

  if (this.currentTargetId) {
    this.isEditMode = true;

    this.form.get('branchId')?.disable();
    this.form.get('targetDate')?.disable();

    this.details.controls.forEach(ctrl => {
      ctrl.get('employeeId')?.disable();
      ctrl.get('shift')?.disable();
      ctrl.get('employeeTarget')?.disable();
      ctrl.get('employeeAchieved')?.enable();
    });

    this.form.get('totalBranchTarget')?.disable();
    this.form.get('totalAchieved')?.enable();
  }
}

}
