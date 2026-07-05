import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { PettyHolderService } from '../../services/Expenses/petty-holder.service';
import { MasterDataService } from '../../services/master-data.service';
import { UserCashCityService } from '../../services/Expenses/user-cash-city.service';

@Component({
  selector: 'app-petty-holder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './petty-holder.component.html',
  styleUrls: ['./petty-holder.component.css']
})
export class PettyHolderComponent implements OnInit {

  form!: FormGroup;

  pettyHolders: any[] = [];
  users: any[] = [];
  cities: any[] = [];
  regions: any[] = [];

  loading = false;
  message = '';
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private pettyService: PettyHolderService,
    private masterData: MasterDataService,
    private userCashService: UserCashCityService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPettyHolders();
    this.loadUsers();
    this.loadCities();
    this.loadRegions();
  }

  buildForm() {
    this.form = this.fb.group({
      id: [0],
      name: [''],
      phoneNumber: [''],
      userId: [''],
      cityIds: [[]],     // 🔥 Multi-select
      regionId: [null],
      isActive: [true]
    });
  }

  loadPettyHolders() {
    this.pettyService.getAll().subscribe(res => {
      this.pettyHolders = res || [];
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

  edit(item: any) {
    this.isEdit = true;
    this.form.patchValue({
      id: item.id,
      name: item.name,
      phoneNumber: item.phoneNumber,
      userId: item.userId,
      cityIds: item.cityIds,   // 🔥 تحميل المدن
      regionId: item.regionId,
      isActive: item.isActive
    });
  }

  resetForm() {
    this.isEdit = false;
    this.message = '';
    this.form.reset({
      id: 0,
      name: '',
      phoneNumber: '',
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
      this.pettyService.update(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم التعديل بنجاح';
          this.loadPettyHolders();
        },
        error: () => {
          this.loading = false;
          this.message = 'حدث خطأ أثناء التعديل';
        }
      });
    } else {
      this.pettyService.create(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم إضافة صاحب العهدة بنجاح';
          this.loadPettyHolders();
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
      ? this.pettyService.deactivate(item.id)
      : this.pettyService.activate(item.id);

    action.subscribe(() => {
      this.loadPettyHolders();
    });
  }
}
