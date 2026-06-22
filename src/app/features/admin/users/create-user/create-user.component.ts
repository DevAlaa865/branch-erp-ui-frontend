import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MasterDataService } from '../../../../services/master-data.service';
import { API_BASE_URL } from '../../../../api.config';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {

  form!: FormGroup;

  roles: { id: string; name: string }[] = [];
  filteredRoles: { id: string; name: string }[] = [];
  roleSearch = '';

  branches: { id: number; branchName: string }[] = [];
  cities: { id: number; cityName: string }[] = [];

  isSaving = false;
  message = '';
  roleError = '';
  branchError = '';
  cityError = '';

  private baseUrl = API_BASE_URL;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private masterData: MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadRoles();
    this.loadBranches();
    this.loadCities();
  }

  buildForm() {
    this.form = this.fb.group({
  userName: ['', Validators.required],
  displayName: ['', Validators.required],
  email: ['', Validators.required],
  password: ['', Validators.required],
  confirmPassword: ['', Validators.required],

  roleName: ['', Validators.required],
  roleSearch: [''],   // 🔥 أضف ده

  userType: [1],
  branchId: [null],
  cityIds: [[]],
  departmentId: [null]
});

  }

  loadBranches() {
    this.masterData.getBranches().subscribe({
      next: (res: any) => this.branches = res.success ? res.data : [],
      error: _ => this.branches = []
    });
  }

  loadCities() {
    this.masterData.getCities().subscribe({
      next: (res: any) => this.cities = res.success ? res.data : [],
      error: _ => this.cities = []
    });
  }

  loadRoles() {
    this.http.get<any>(`${this.baseUrl}/AuthorizationAdmin/roles`)
      .subscribe({
        next: res => {
          this.roles = res.data || [];
          this.filteredRoles = [...this.roles];
        },
        error: _ => {
          this.roles = [];
          this.filteredRoles = [];
        }
      });
  }

  filterRoles() {
    const term = this.roleSearch.toLowerCase().trim();
    this.filteredRoles = term
      ? this.roles.filter(r => r.name.toLowerCase().includes(term))
      : [...this.roles];
  }

  onUserTypeChange() {
    const type = this.form.value.userType;

    if (type === 1) {
      this.form.patchValue({ cityIds: [] });
    }

    if (type === 2) {
      this.form.patchValue({ branchId: null });
    }

    if (type === 3) {
      this.form.patchValue({ branchId: null, cityIds: [] });
    }

    this.branchError = '';
    this.cityError = '';
  }

  validate(): boolean {
    this.roleError = '';
    this.branchError = '';
    this.cityError = '';
    this.message = '';

    const v = this.form.value;

    if (!v.roleName) {
      this.roleError = 'من فضلك اختر الدور الوظيفي';
      return false;
    }

    if (v.userType === 1 && !v.branchId) {
      this.branchError = 'من فضلك اختر الفرع';
      return false;
    }

    if (v.userType === 2 && (!v.cityIds || v.cityIds.length === 0)) {
      this.cityError = 'من فضلك اختر مدينة واحدة على الأقل';
      return false;
    }

    if (!v.userName || !v.displayName || !v.email || !v.password || !v.confirmPassword) {
      this.message = 'من فضلك أكمل جميع الحقول المطلوبة';
      return false;
    }

    if (v.password !== v.confirmPassword) {
      this.message = 'كلمتا المرور غير متطابقتين';
      return false;
    }

    return true;
  }

  createUser() {
    if (!this.validate()) return;

    this.isSaving = true;
    this.message = '';

    this.http.post<any>(`${this.baseUrl}/Auth/register`, this.form.value)
      .subscribe({
        next: res => {
          this.isSaving = false;

          if (res.success) {
            this.message = 'تم إنشاء المستخدم بنجاح';
            setTimeout(() => this.router.navigate(['/general-management/users']), 800);
          } else {
            this.message = res.message || 'حدث خطأ أثناء إنشاء المستخدم';
          }
        },
        error: _ => {
          this.isSaving = false;
          this.message = 'حدث خطأ أثناء إنشاء المستخدم';
        }
      });
  }
}
