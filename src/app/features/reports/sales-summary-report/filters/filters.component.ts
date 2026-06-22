import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MasterDataService } from '../../../../services/master-data.service';
import { FormsModule } from '@angular/forms';
import { SalesSummaryReportFilter } from '../../../../shared/models/sales-summary-report.model';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomSelectComponent],
  templateUrl: './filters.component.html'
})
export class FiltersComponent implements OnInit {

  filterForm!: FormGroup;

  regions: any[] = [];
  cities: any[] = [];
  branches: any[] = [];

  filteredCities: any[] = [];
  filteredBranches: any[] = [];

  // 🔥 معلومات المستخدم
  isRegionManager = false;
  isBranchUser = false;
  userCityIds: number[] = [];
  userBranchId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private masterData: MasterDataService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // قراءة نوع المستخدم والمدن والفرع من التوكن
    this.isRegionManager = this.auth.isRegionManager();
    this.userCityIds = this.auth.getCityIds();
    this.userBranchId = this.auth.getBranchId();
    this.isBranchUser = !!this.userBranchId;

    this.loadMasterData();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buildForm() {
    const today = new Date();

    this.filterForm = this.fb.group({
      fromDate: [this.formatDate(today), Validators.required],
      toDate: [this.formatDate(today), Validators.required],
      regionId: [null],
      cityId: [[]],   // 🔥 Multi‑Select
      branchId: [null]
    });

    this.filterForm.get('regionId')?.valueChanges.subscribe(regionId => this.onRegionChanged(regionId));
    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => this.onCityChanged(cityId));
  }

  loadMasterData() {
    // المناطق
    this.masterData.getAreas().subscribe(res => {
      if (res.success) {
        this.regions = res.data.map((r: any) => ({
          id: r.id,
          label: r.regionName
        }));
      }
    });

    // المدن
    this.masterData.getCities().subscribe(res => {
      if (res.success) {
        this.cities = res.data.map((c: any) => ({
          id: c.id,
          label: c.cityName,
          regionId: c.regionId
        }));

        // مدير منطقة → مدنه فقط
        if (this.isRegionManager) {
          this.filteredCities = this.cities.filter(c => this.userCityIds.includes(c.id));
        }
        // مستخدم فرع → مدينة فرعه فقط
        else if (this.isBranchUser && this.userBranchId) {
          const branch = this.branches.find(b => b.id === this.userBranchId);
          this.filteredCities = this.cities.filter(c => c.id === branch?.cityId);
        }
        else {
          this.filteredCities = [...this.cities];
        }
      }
    });

    // الفروع
    this.masterData.getBranches().subscribe(res => {
      if (res.success) {
        this.branches = res.data.map((b: any) => ({
          id: b.id,
          label: b.branchName,
          cityId: b.cityId
        }));

        // مستخدم فرع → فرعه فقط
        if (this.isBranchUser && this.userBranchId) {
          this.filteredBranches = this.branches.filter(b => b.id === this.userBranchId);
          this.filterForm.patchValue({ branchId: this.userBranchId });
        }
        // مدير منطقة → فروع مدنه فقط
        else if (this.isRegionManager) {
          this.filteredBranches = this.branches.filter(b => this.userCityIds.includes(b.cityId));
        }
        else {
          this.filteredBranches = [...this.branches];
        }
      }
    });
  }

  onRegionChanged(regionId: number | null) {
    if (this.isRegionManager || this.isBranchUser) return;

    if (!regionId) {
      this.filteredCities = [...this.cities];
      this.filteredBranches = [...this.branches];
      this.filterForm.patchValue({ cityId: [], branchId: null }, { emitEvent: false });
      return;
    }

    this.filteredCities = this.cities.filter(c => c.regionId === regionId);
    this.filterForm.patchValue({ cityId: [], branchId: null }, { emitEvent: false });

    const cityIds = this.filteredCities.map(c => c.id);
    this.filteredBranches = this.branches.filter(b => cityIds.includes(b.cityId));
  }

  onCityChanged(cityId: number[] | null) {
    if (this.isBranchUser) return;

    if (!cityId || cityId.length === 0) {
      if (this.isRegionManager) {
        this.filteredBranches = this.branches.filter(b => this.userCityIds.includes(b.cityId));
      } else {
        this.filteredBranches = [...this.branches];
      }

      this.filterForm.patchValue({ branchId: null }, { emitEvent: false });
      return;
    }

    // 🔥 Multi‑Select → فلترة الفروع حسب كل المدن المختارة
    this.filteredBranches = this.branches.filter(b => cityId.includes(b.cityId));
    this.filterForm.patchValue({ branchId: null }, { emitEvent: false });
  }

  submit() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const raw = this.filterForm.value;

    const filter: SalesSummaryReportFilter = {
      fromDate: raw.fromDate,
      toDate: raw.toDate,
      regionId: this.isRegionManager ? '' : (raw.regionId ?? ''),
      cityId: Array.isArray(raw.cityId) ? raw.cityId.join(',') : '',
      branchId: raw.branchId ?? ''
    };

    const query = new URLSearchParams({
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      regionId: filter.regionId?.toString() ?? '',
      cityId: filter.cityId?.toString() ?? '',
      branchId: filter.branchId?.toString() ?? ''
    }).toString();

    window.open(`/reports/sales-summary-report-result?${query}`, '_blank');
  }

}
