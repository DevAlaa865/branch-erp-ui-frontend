import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { UserCashCityService } from '../../../services/Expenses/user-cash-city.service';


@Component({
  selector: 'app-user-cash-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './user-cash-city.component.html',
  styleUrls: ['./user-cash-city.component.css']
})
export class UserCashCityComponent implements OnInit {

  form!: FormGroup;

  users: any[] = [];
  cities: any[] = [];

  roleTypes = [
    { id: 1, name: 'مسؤول إيداع' },
    { id: 2, name: 'صاحب عهدة' },
    { id: 3, name: 'إدارة صناديق' },
    { id: 4, name: 'مدير معتمد' },
    { id: 5, name: 'محاسب صناديق' }
  ];

  message = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: UserCashCityService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadUsers();
    this.loadCities();
  }

  buildForm() {
    this.form = this.fb.group({
      userId: [''],
      roleType: [null],
      cityIds: [[]]
    });
  }

  loadUsers() {
    this.service.getUsers().subscribe(res => {
      this.users = res.success ? res.data : [];
    });
  }

  loadCities() {
    this.service.getCities().subscribe(res => {
      this.cities = res.success ? res.data : [];
    });
  }

  onUserChange(userId: string) {
    this.form.patchValue({ cityIds: [], roleType: null });

    if (!userId) return;

    this.service.getUserCashCities(userId).subscribe(res => {
      if (res.success && res.data.length > 0) {
        const first = res.data[0];

        this.form.patchValue({
          roleType: first.roleType,
          cityIds: res.data.map((x: any) => x.cityId)
        });
      }
    });
  }

  save() {
    this.loading = true;
    this.message = '';

    this.service.saveUserCashCities(this.form.value).subscribe({
      next: res => {
        this.loading = false;
        this.message = res.success ? 'تم الحفظ بنجاح' : 'حدث خطأ أثناء الحفظ';
      },
      error: _ => {
        this.loading = false;
        this.message = 'حدث خطأ أثناء الحفظ';
      }
    });
  }
}
