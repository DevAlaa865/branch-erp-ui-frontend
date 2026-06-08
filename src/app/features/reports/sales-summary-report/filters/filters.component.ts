import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MasterDataService } from '../../../../services/master-data.service';
import { FormsModule } from '@angular/forms';
import { SalesSummaryReportFilter } from '../../../../shared/models/sales-summary-report.model';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';

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

  constructor(
    private fb: FormBuilder,
    private masterData: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadMasterData();
  }

  // ✅ تنسيق التاريخ بدون UTC
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
      cityId: [null],
      branchId: [null]
    });

    this.filterForm.get('regionId')?.valueChanges.subscribe(regionId => this.onRegionChanged(regionId));
    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => this.onCityChanged(cityId));
  }

  loadMasterData() {
    this.masterData.getAreas().subscribe(res => {
      if (res.success) {
        this.regions = res.data.map((r: any) => ({
          id: r.id,
          label: r.regionName
        }));
      }
    });

    this.masterData.getCities().subscribe(res => {
      if (res.success) {
        this.cities = res.data.map((c: any) => ({
          id: c.id,
          label: c.cityName,
          regionId: c.regionId
        }));
        this.filteredCities = [...this.cities];
      }
    });

    this.masterData.getBranches().subscribe(res => {
      if (res.success) {
        this.branches = res.data.map((b: any) => ({
          id: b.id,
          label: b.branchName,
          cityId: b.cityId
        }));
        this.filteredBranches = [...this.branches];
      }
    });
  }

  onRegionChanged(regionId: number | null) {
    if (!regionId) {
      this.filteredCities = [...this.cities];
      this.filteredBranches = [...this.branches];
      this.filterForm.patchValue({ cityId: null, branchId: null }, { emitEvent: false });
      return;
    }

    this.filteredCities = this.cities.filter(c => c.regionId === regionId);
    this.filterForm.patchValue({ cityId: null, branchId: null }, { emitEvent: false });

    const cityIds = this.filteredCities.map(c => c.id);
    this.filteredBranches = this.branches.filter(b => cityIds.includes(b.cityId));
  }

  onCityChanged(cityId: number | null) {
    if (!cityId) {
      const regionId = this.filterForm.value.regionId;

      if (regionId) {
        const regionCities = this.cities.filter(c => c.regionId === regionId).map(c => c.id);
        this.filteredBranches = this.branches.filter(b => regionCities.includes(b.cityId));
      } else {
        this.filteredBranches = [...this.branches];
      }

      this.filterForm.patchValue({ branchId: null }, { emitEvent: false });
      return;
    }

    this.filteredBranches = this.branches.filter(b => b.cityId === cityId);
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
    regionId: raw.regionId ?? '',
    cityId: raw.cityId ?? '',
    branchId: raw.branchId ?? ''
  };

  // تحويل الفلتر إلى Query String
  const query = new URLSearchParams({
    fromDate: filter.fromDate,
    toDate: filter.toDate,
    regionId: filter.regionId?.toString() ?? '',
    cityId: filter.cityId?.toString() ?? '',
    branchId: filter.branchId?.toString() ?? ''
  }).toString();

  // فتح صفحة جديدة
  window.open(`/reports/sales-summary-report-result?${query}`, '_blank');
}

}
