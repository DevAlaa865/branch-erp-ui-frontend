import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MasterDataService } from '../../../../services/master-data.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {

  model = {
    userName: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleName: '',

    // 🔥 userType الآن رقم وليس نص
    userType: 1,   // 1 = Branch, 2 = CityManager, 3 = Central

    branchId: null as number | null,
    cityId: null as number | null,
    departmentId: null as number | null
  };

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

  private baseUrl = 'https://localhost:7025';

  constructor(
    private http: HttpClient,
    private router: Router,
    private masterData: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadBranches();
    this.loadCities();
  }

  loadBranches() {
    this.masterData.getBranches().subscribe({
      next: (res: any) => {
        this.branches = res.success ? res.data : [];
      },
      error: _ => this.branches = []
    });
  }

  loadCities() {
    this.masterData.getCities().subscribe({
      next: (res: any) => {
        this.cities = res.success ? res.data : [];
      },
      error: _ => this.cities = []
    });
  }

  loadRoles() {
    this.http.get<any>(`${this.baseUrl}/api/AuthorizationAdmin/roles`)
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
    if (this.model.userType === 1) {
      this.model.cityId = null;
    } else if (this.model.userType === 2) {
      this.model.branchId = null;
    } else {
      this.model.branchId = null;
      this.model.cityId = null;
    }

    this.branchError = '';
    this.cityError = '';
  }

  validate(): boolean {
    this.roleError = '';
    this.branchError = '';
    this.cityError = '';
    this.message = '';

    if (!this.model.roleName) {
      this.roleError = 'من فضلك اختر الدور الوظيفي';
      return false;
    }

    if (this.model.userType === 1 && !this.model.branchId) {
      this.branchError = 'من فضلك اختر الفرع';
      return false;
    }

    if (this.model.userType === 2 && !this.model.cityId) {
      this.cityError = 'من فضلك اختر المدينة';
      return false;
    }

    if (!this.model.userName || !this.model.displayName || !this.model.email ||
        !this.model.password || !this.model.confirmPassword) {
      this.message = 'من فضلك أكمل جميع الحقول المطلوبة';
      return false;
    }

    if (this.model.password !== this.model.confirmPassword) {
      this.message = 'كلمتا المرور غير متطابقتين';
      return false;
    }

    return true;
  }

  createUser() {
    if (!this.validate()) return;

    this.isSaving = true;
    this.message = '';

    this.http.post<any>(`${this.baseUrl}/api/Auth/register`, this.model)
      .subscribe({
        next: res => {
          this.isSaving = false;

          if (res.success) {
            this.message = 'تم إنشاء المستخدم بنجاح';
            setTimeout(() => this.router.navigate(['/admin/users']), 800);
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
