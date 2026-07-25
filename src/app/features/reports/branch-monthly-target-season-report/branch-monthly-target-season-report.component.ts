import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchMonthlyTargetSeasonService } from '../../../services/branch-monthly-target-season.service';



@Component({
  selector: 'app-branch-monthly-target-season-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomSelectComponent],
  templateUrl: './branch-monthly-target-season-report.component.html'
})
export class BranchMonthlyTargetSeasonReportComponent implements OnInit {

  filterForm!: FormGroup;

  cities: any[] = [];
  branches: any[] = [];

  filteredCities: any[] = [];
  filteredBranches: any[] = [];

  constructor(
    private fb: FormBuilder,
    private masterData: MasterDataService,
    private reportService: BranchMonthlyTargetSeasonService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadMasterData();
  }

  buildForm() {
    const today = new Date();

    this.filterForm = this.fb.group({
      month: [today.getMonth() + 1, Validators.required],
      year: [today.getFullYear(), Validators.required],
      cityId: [[]],
      branchId: [null]
    });

    this.filterForm.get('cityId')?.valueChanges.subscribe(cityIds => this.onCityChanged(cityIds));
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
      month: raw.month.toString(),
      year: raw.year.toString(),
      cityIds: raw.cityId?.length ? raw.cityId.join(',') : '',
      branchIds: raw.branchId ? raw.branchId.toString() : ''
    }).toString();

    window.open(`/reports/branch-monthly-target-season/result?${query}`, '_blank');
  }
}
