import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';
import { MasterDataService } from '../../../services/master-data.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-daily-target',
  standalone: true,
imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './daily-target.component.html',
  styleUrls: ['./daily-target.component.css']
})
export class DailyTargetComponent implements OnInit {

  form!: FormGroup;
  employees: any[] = [];
branches: any[] = [];
shifts = [
  { id: 1, name: 'صباحي' },
  { id: 2, name: 'ظهيرة' },
  { id: 3, name: 'عصر' },
  { id: 4, name: 'مساء' },
  { id: 5, name: 'ليل' },
  { id: 6, name: 'فجر' }
];

  constructor(
    private fb: FormBuilder,
    private targetService: BranchDailyTargetService,
    private master: MasterDataService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadEmployees();
      this.loadBranches(); 
    this.initBranchFromUser();
  }

  // ============================
  // Build Form
  // ============================
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

  // ============================
  // Load Employees
  // ============================
  loadEmployees() {
    this.master.getEmployees().subscribe(res => {
      this.employees = res.data;
    });
  }
  

  loadBranches() {
  this.master.getBranches().subscribe(res => {
    this.branches = res.data;
  });
}

  // ============================
  // Auto-fill Branch from Token
  // ============================
  initBranchFromUser() {
    const user = this.auth.getUserInfo();
    if (user && user.branchId) {
      this.form.get('branchId')?.setValue(user.branchId);
    }
  }

  // ============================
  // Add Row
  // ============================
  addRow() {
    const row = this.fb.group({
      employeeId: [null, Validators.required],
      shift: [1, Validators.required],
      employeeTarget: [0, [Validators.required, Validators.min(0)]],
      employeeAchieved: [0, [Validators.required, Validators.min(0)]]
    });

    this.details.push(row);
  }

  // ============================
  // Remove Row
  // ============================
  removeRow(i: number) {
    this.details.removeAt(i);
  }

  // ============================
  // Save
  // ============================
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('من فضلك أكمل جميع الحقول');
      return;
    }

    const payload = this.form.value;

    this.targetService.create(payload).subscribe({
      next: res => {
        alert('تم الحفظ بنجاح');
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        console.error(err);
        alert('حدث خطأ أثناء الحفظ');
      }
    });
  }
}
