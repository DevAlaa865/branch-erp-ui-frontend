import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchDailyDifferenceReportService } from '../../../services/reports/branch-daily-difference-report.service';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyDifferenceReport } from '../../../shared/models/branch-daily-difference-report.model';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-branch-daily-difference-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './branch-daily-difference-report.component.html',
  styleUrls: ['./branch-daily-difference-report.component.css']
})
export class BranchDailyDifferenceReportComponent implements OnInit {

  form!: FormGroup;

  report: BranchDailyDifferenceReport[] = [];
  cities: any[] = [];
  branches: any[] = [];

  loading = false;
  loaded = false;
  errorMessage: string | null = null;

  branchIdsControl = new FormControl<number[]>([]);

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // ⭐ الإجماليات
  totalNegativeDifference = 0;
  totalPositiveDifference = 0;
  totalNetworkAmount = 0;

  constructor(
    private fb: FormBuilder,
    private reportService: BranchDailyDifferenceReportService,
    private masterService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],

      // ⭐ طريقة اختيار الفرع
      branchMode: ['manual'],   // manual | dropdown

      cityId: [null],
      branchNumber: [null],

      // ⭐ نوع التقرير
      reportType: ['difference'], // difference | network

      // ⭐ الفلاتر الجديدة
      isAllowedShortage: [true],   // من -35 إلى -1
      isBigShortage: [false],      // أقل من -35
      isIncrease: [false],         // أكبر من 0

      isNetworkReport: [false]
    });
  }

  resetReport(): void {
    this.report = [];
    this.loaded = false;

    // إعادة تعيين الإجماليات
    this.totalNegativeDifference = 0;
    this.totalPositiveDifference = 0;
    this.totalNetworkAmount = 0;
  }

  // ⭐ تغيير طريقة اختيار الفرع
  changeBranchMode(mode: 'manual' | 'dropdown'): void {
    this.resetReport();
    this.form.patchValue({ branchMode: mode });

    if (mode === 'manual') {
      this.form.patchValue({ cityId: null });
      this.branches = [];
      this.branchIdsControl.setValue([]);
    }

    if (mode === 'dropdown') {
      this.form.patchValue({ branchNumber: null });
    }
  }

  // ⭐ تغيير نوع التقرير
  changeReportType(type: 'difference' | 'network'): void {
    this.resetReport();

    this.form.patchValue({ reportType: type });

    if (type === 'difference') {
      this.form.patchValue({
        isNetworkReport: false,
        isAllowedShortage: true,
        isBigShortage: false,
        isIncrease: false
      });
    }

    if (type === 'network') {
      this.form.patchValue({
        isNetworkReport: true,
        isAllowedShortage: null,
        isBigShortage: null,
        isIncrease: null
      });
    }
  }

  // ⭐ اختيار نوع الفرق (3 أنواع)
  selectDiff(type: 'allowed' | 'big' | 'increase'): void {
    this.resetReport();

    this.form.patchValue({
      reportType: 'difference',
      isNetworkReport: false
    });

    if (type === 'allowed') {
      this.form.patchValue({
        isAllowedShortage: true,
        isBigShortage: false,
        isIncrease: false
      });
    }

    if (type === 'big') {
      this.form.patchValue({
        isAllowedShortage: false,
        isBigShortage: true,
        isIncrease: false
      });
    }

    if (type === 'increase') {
      this.form.patchValue({
        isAllowedShortage: false,
        isBigShortage: false,
        isIncrease: true
      });
    }
  }

  toggleNetworkReport(): void {
    this.resetReport();

    this.form.patchValue({
      reportType: 'network',
      isAllowedShortage: null,
      isBigShortage: null,
      isIncrease: null
    });
  }

  loadCities(): void {
    this.masterService.getCities().subscribe({
      next: (res) => this.cities = res.data || res || [],
      error: () => this.cities = []
    });
  }

  onCityChange(): void {
    this.resetReport();

    const cityId = this.form.value.cityId;

    if (!cityId) {
      this.branches = [];
      this.branchIdsControl.setValue([]);
      return;
    }

    this.masterService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => {
        this.branches = res.data || res || [];
        this.branchIdsControl.setValue([]);
      },
      error: () => {
        this.branches = [];
        this.branchIdsControl.setValue([]);
      }
    });
  }

  selectAllBranches(): void {
    this.resetReport();
    const allIds = this.branches.map(b => b.id);
    this.branchIdsControl.setValue(allIds);
  }

  excludeBranch(id: number): void {
    this.resetReport();
    const current = this.branchIdsControl.value || [];
    this.branchIdsControl.setValue(current.filter(x => x !== id));
  }

  loadReport(): void {
    this.errorMessage = null;
    this.loading = true;

    const filter = {
      cityId: this.form.value.cityId,
      branchIds: this.branchIdsControl.value || [],
      branchNumber: this.form.value.branchNumber,

      // ⭐ الفلاتر الجديدة
      isAllowedShortage: this.form.value.isAllowedShortage,
      isBigShortage: this.form.value.isBigShortage,
      isIncrease: this.form.value.isIncrease,

      isNetworkReport: this.form.value.isNetworkReport,

      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate
    };

    this.reportService.getReport(filter).subscribe({
      next: (res: any) => {
        this.report = res.data || res || [];
        this.totalPages = Math.ceil(this.report.length / this.pageSize);
        this.currentPage = 1;
        this.loaded = true;
        this.loading = false;

        // ⭐ حساب الإجماليات
        this.calculateTotals();
      },
      error: () => {
        this.report = [];
        this.errorMessage = 'حدث خطأ أثناء تحميل تقرير الفرق';
        this.loaded = true;
        this.loading = false;
      }
    });
  }

  // ⭐ دالة حساب الإجماليات
calculateTotals(): void {

  if (this.form.value.reportType === 'difference') {

    this.totalNegativeDifference = this.report
      .filter(r => (r.difference ?? 0) < 0)
      .reduce((sum, r) => sum + (r.difference ?? 0), 0);

    this.totalPositiveDifference = this.report
      .filter(r => (r.difference ?? 0) > 0)
      .reduce((sum, r) => sum + (r.difference ?? 0), 0);
  }

  if (this.form.value.reportType === 'network') {
    this.totalNetworkAmount = this.report
      .reduce((sum, r) => sum + (r.networkAmount ?? 0), 0);
  }
}

  get pagedReport(): BranchDailyDifferenceReport[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.report.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

printReport(): void {
  const printContents = document.getElementById('printArea')?.innerHTML;

  if (!printContents) return;

  const popup = window.open('', '_blank', 'width=1000,height=800');

  if (!popup) return;

  popup.document.open();
  popup.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>طباعة التقرير</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #f1f5f9; }
          h2 { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>تقرير الفرق بين المبيعات والشبكة</h2>
        ${printContents}
      </body>
    </html>
  `);

  popup.document.close();
  popup.print();
}


}
