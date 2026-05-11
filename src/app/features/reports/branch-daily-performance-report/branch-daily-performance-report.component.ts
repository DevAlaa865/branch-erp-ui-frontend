import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  // 🔹 الباجينيشن
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private reportService: BranchDailyPerformanceReportService,
    private masterService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      date: [today],
      cityId: [null],
      branchId: [null]
    });
  }

  loadCities(): void {
    this.masterService.getCities().subscribe({
      next: (res) => this.cities = res.data || [],
      error: () => this.cities = []
    });
  }

  onCityChange(): void {
    const cityId = this.form.value.cityId;
    if (!cityId) {
      this.branches = [];
      this.form.patchValue({ branchId: null });
      return;
    }

    this.masterService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => this.branches = res.data || res || [],
      error: () => this.branches = []
    });
  }

  loadReport(): void {
    this.errorMessage = null;
    this.loading = true;
    const filter = this.form.value;

    this.reportService.getReport(filter).subscribe({
      next: (data) => {
        this.report = data.map(row => ({
          ...row,
          targetDate: row.targetDate?.split('T')[0] || ''
        }));
        this.totalPages = Math.ceil(this.report.length / this.pageSize);
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

  exportToExcel(): void {
  const filter = this.form.value;

  this.loading = true;

  this.reportService.exportToExcel(filter).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      const fileName = `BranchDailyReport_${filter.date}.xlsx`;

      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      alert("حدث خطأ أثناء تصدير التقرير إلى Excel");
    }
  });
}


  // 🔹 عرض الشارت
  showChart(): void {
    this.router.navigate(['/branch-performance-chart'], {
      queryParams: { date: this.form.value.date, cityId: this.form.value.cityId }
    });
  }

  // 🔹 الباجينيشن
  get pagedReport(): BranchDailyPerformanceReportRowDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.report.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
}
