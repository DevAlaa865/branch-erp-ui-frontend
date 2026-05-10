import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import {
  BranchDailyPerformanceReportService,
  BranchDailyPerformanceReportRowDto
} from '../../../services/branch-daily-performance-report.service';

@Component({
  selector: 'app-branch-daily-performance-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branch-daily-performance-report.component.html',
  styleUrls: ['./branch-daily-performance-report.component.css']
})
export class BranchDailyPerformanceReportComponent implements OnInit {

  form!: FormGroup;

  report: BranchDailyPerformanceReportRowDto[] = [];
  cities: any[] = [];
  branches: any[] = [];

  loading = false;
  loaded = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private reportService: BranchDailyPerformanceReportService,
    private masterService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  // ============================
  // بناء النموذج (Reactive Form)
  // ============================
  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      date: [today],
      cityId: [null],
      branchId: [null]
    });
  }

  // ============================
  // تحميل المدن
  // ============================
  loadCities(): void {
    this.masterService.getCities().subscribe({
      next: (res) => {
        this.cities = res.data || [];
      },
      error: () => {
        this.cities = [];
      }
    });
  }

  // ============================
  // تحميل الفروع عند اختيار مدينة
  // ============================
  onCityChange(): void {
    const cityId = this.form.value.cityId;

    if (!cityId) {
      this.branches = [];
      this.form.patchValue({ branchId: null });
      return;
    }

    this.masterService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => {
        this.branches = res.data || res || [];
      },
      error: () => {
        this.branches = [];
      }
    });
  }

  // ============================
  // تحميل التقرير
  // ============================
  loadReport(): void {
    this.errorMessage = null;
    this.loading = true;
console.log("FILTER SENT TO API:", this.form.value);

    const filter = this.form.value;

    this.reportService.getReport(filter).subscribe({
      next: (data) => {
        this.report = data.map(row => ({
          ...row,
          targetDate: row.targetDate?.split('T')[0] || ''
        }));

        this.loaded = true;
        this.loading = false;
      },
      error: () => {
        this.report = [];
        this.errorMessage = 'حدث خطأ أثناء تحميل التقرير';
        this.loaded = true;
        this.loading = false;
      }
    });
  }
}
