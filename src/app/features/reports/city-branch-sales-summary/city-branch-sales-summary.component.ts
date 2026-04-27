import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-city-branch-sales-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomSelectComponent
  ],
  templateUrl: './city-branch-sales-summary.component.html',
  styleUrls: ['./city-branch-sales-summary.component.css']
})
export class CityBranchSalesSummaryComponent implements OnInit {

  form!: FormGroup;

  cities: any[] = [];
  branches: any[] = [];
  activityTypes: any[] = [];

  branchTypes = [
    { value: 'All', label: 'الكل' },
    { value: 'Shop', label: 'محل' },
    { value: 'Kiosk', label: 'كشك' }
  ];

  constructor(
    private fb: FormBuilder,
    private master: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadMasterData();
  }

  buildForm(): void {
    this.form = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      cityIds: [[]],
      branchIds: [[]],
      activityTypeId: [null],
      branchType: ['All']
    });

    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({
      fromDate: today,
      toDate: today
    });
  }

  loadMasterData(): void {
    this.master.getCities().subscribe(res => this.cities = res.data || []);
    this.master.getActivityTypes().subscribe(res => this.activityTypes = res.data || []);
  }

onCitiesChange(): void {
  const ids = this.form.value.cityIds;

  // لو مفيش مدن → فضي الفروع
  if (!ids || !ids.length) {
    this.branches = [];
    this.form.patchValue({ branchIds: [] });
    return;
  }

  // نجيب الفروع بناءً على أول مدينة فقط
  const firstCityId = ids[0];

  this.master.getBranchesByCity(firstCityId).subscribe({
    next: (res: any) => {
      const data = res?.data ?? res ?? [];
      this.branches = data;
      this.form.patchValue({ branchIds: [] });
    }
  });
}


  showResult(): void {
    if (this.form.invalid) return;

    const f = this.form.value;

    this.router.navigate(
      ['/reports/city-branch-sales-summary/result'],
      {
        queryParams: {
          fromDate: f.fromDate,
          toDate: f.toDate,
          cityIds: f.cityIds?.length ? f.cityIds : null,
          branchIds: f.branchIds?.length ? f.branchIds : null,
          activityTypeId: f.activityTypeId,
          branchType: f.branchType
        }
      }
    );
  }
}
