import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { DepositCollectorService } from '../../services/Expenses/deposit-collector.service';
import { MasterDataService } from '../../services/master-data.service';
import { UserCashCityService } from '../../services/Expenses/user-cash-city.service';

@Component({
  selector: 'app-deposit-collectors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './deposit-collectors.component.html',
  styleUrls: ['./deposit-collectors.component.css']
})
export class DepositCollectorsComponent implements OnInit {

  form!: FormGroup;

  collectors: any[] = [];
  users: any[] = [];
  cities: any[] = [];
  regions: any[] = [];

  loading = false;
  message = '';
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private depositService: DepositCollectorService,
    private masterData: MasterDataService,
    private userCashService: UserCashCityService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCollectors();
    this.loadUsers();
    this.loadCities();
    this.loadRegions();
  }

  // 🔥 الفورم بعد التعديل
  buildForm() {
    this.form = this.fb.group({
      id: [0],
      userId: [''],
      cityIds: [[]],     // 🔥 Multi-select
      regionId: [null],
      isActive: [true]
    });
  }

  loadCollectors() {
    this.depositService.getAll().subscribe(res => {
      this.collectors = res || [];
    });
  }

  loadUsers() {
    this.userCashService.getUsers().subscribe(res => {
      this.users = res.success ? res.data : [];
    });
  }

  loadCities() {
    this.masterData.getCities().subscribe(res => {
      this.cities = res.success ? res.data : [];
    });
  }

  loadRegions() {
    this.masterData.getAreas().subscribe(res => {
      this.regions = res.success ? res.data : [];
    });
  }

  // 🔥 تحميل بيانات التعديل
  edit(item: any) {
    this.isEdit = true;
    this.form.patchValue({
      id: item.id,
      userId: item.userId,
      cityIds: item.cityIds,   // 🔥 Multi-select
      regionId: item.regionId,
      isActive: item.isActive
    });
  }

  resetForm() {
    this.isEdit = false;
    this.message = '';
    this.form.reset({
      id: 0,
      userId: '',
      cityIds: [],      // 🔥 reset
      regionId: null,
      isActive: true
    });
  }

  save() {
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';
    const body = this.form.value;

    if (this.isEdit) {
      this.depositService.update(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم التعديل بنجاح';
          this.loadCollectors();
        },
        error: () => {
          this.loading = false;
          this.message = 'حدث خطأ أثناء التعديل';
        }
      });
    } else {
      this.depositService.create(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم إضافة مسؤول الإيداع بنجاح';
          this.loadCollectors();
          this.resetForm();
        },
        error: () => {
          this.loading = false;
          this.message = 'حدث خطأ أثناء الإنشاء';
        }
      });
    }
  }

  toggleActive(item: any) {
    const action = item.isActive
      ? this.depositService.deactivate(item.id)
      : this.depositService.activate(item.id);

    action.subscribe(() => {
      this.loadCollectors();
    });
  }
}
