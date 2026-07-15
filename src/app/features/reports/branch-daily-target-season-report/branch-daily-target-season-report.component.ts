import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';


@Component({
  selector: 'app-branch-daily-target-season-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomSelectComponent],
  templateUrl: './branch-daily-target-season-report.component.html'
})
export class BranchDailyTargetSeasonReportComponent implements OnInit {

  filterForm!: FormGroup;
 
  regions: any[] = [];
  cities: any[] = [];
  branches: any[] = [];

  filteredCities: any[] = [];
  filteredBranches: any[] = [];

  constructor(
    private fb: FormBuilder,
    private masterData: MasterDataService,
    private reportService: BranchDailyTargetSeasonReportService
  ) {}

  ngOnInit(): void {
    this.buildForm();
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
      cityId: [[]],     // 🔥 نفس الاسم بالضبط
      branchId: [null]  // 🔥 نفس الاسم بالضبط
    });

    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => this.onCityChanged(cityId));
  }

  loadMasterData() {
    // المدن
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

    // الفروع
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

  onCityChanged(cityIds: number[] | null) {
    if (!cityIds || cityIds.length === 0) {
      this.filteredBranches = [...this.branches];
      return;
    }

    this.filteredBranches = this.branches.filter(b => cityIds.includes(b.cityId));
  }

submit() {
  const raw = this.filterForm.value;

  const query = new URLSearchParams({
    fromDate: raw.fromDate,
    toDate: raw.toDate,
    cityIds: raw.cityId?.length ? raw.cityId.join(',') : '',
    branchIds: raw.branchId ? raw.branchId.toString() : ''
  }).toString();

  window.open(`/reports/branch-daily-target/season/result?${query}`, '_blank');
}
openChartWindow() {
  const raw = this.filterForm.value;

  const query = new URLSearchParams({
    fromDate: raw.fromDate,
    toDate: raw.toDate,
    cityIds: raw.cityId?.length ? raw.cityId.join(',') : '',
    branchIds: raw.branchId ? raw.branchId.toString() : ''
  }).toString();

  window.open(`/reports/branch-daily-target/season/chart?${query}`, '_blank');
}



}
