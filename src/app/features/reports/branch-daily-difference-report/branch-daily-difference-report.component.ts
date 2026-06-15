import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchDailyDifferenceReportService } from '../../../services/reports/branch-daily-difference-report.service';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyDifferenceReport } from '../../../shared/models/branch-daily-difference-report.model';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { BranchControlIssueService } from '../../../services/branch-control-issue.service';
import { AuthService } from '../../../services/auth.service';

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
    private masterService: MasterDataService,
    private controlIssueService: BranchControlIssueService,
    private authService: AuthService
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

      branchMode: ['manual'],

      cityIds: [[]],
      branchNumber: [null],

      reportType: ['difference'],

      // ⭐ العجز
      isAllowedShortage: [true],
      isBigShortage: [false],

      // ⭐ الزيادة الجديدة
      isSmallIncrease: [false],
      isBigIncrease: [false],

      isNetworkReport: [false]
    });
  }

  resetReport(): void {
    this.report = [];
    this.loaded = false;

    this.totalNegativeDifference = 0;
    this.totalPositiveDifference = 0;
    this.totalNetworkAmount = 0;
  }

  changeBranchMode(mode: 'manual' | 'dropdown'): void {
    this.resetReport();
    this.form.patchValue({ branchMode: mode });

    if (mode === 'manual') {
      this.form.patchValue({ cityIds: []  });
      this.branches = [];
      this.branchIdsControl.setValue([]);
    }

    if (mode === 'dropdown') {
      this.form.patchValue({ branchNumber: null });
    }
  }

  changeReportType(type: 'difference' | 'network'): void {
    this.resetReport();

    this.form.patchValue({ reportType: type });

    if (type === 'difference') {
      this.form.patchValue({
        isNetworkReport: false,
        isAllowedShortage: true,
        isBigShortage: false,
        isSmallIncrease: false,
        isBigIncrease: false
      });
    }

    if (type === 'network') {
      this.form.patchValue({
        isNetworkReport: true,
        isAllowedShortage: null,
        isBigShortage: null,
        isSmallIncrease: null,
        isBigIncrease: null
      });
    }
  }

selectedDiffType: number | null = null; // 1 = عجز ، 2 = زيادة
showTransferButton: boolean = false;    // ⭐ فلاج ظهور زرار التحويل

selectDiff(type: 'allowed' | 'big' | 'smallIncrease' | 'bigIncrease'): void {
  this.resetReport();

  this.form.patchValue({
    reportType: 'difference',
    isNetworkReport: false
  });

  // ⭐ تحديد ظهور زرار التحويل
  this.showTransferButton = (type === 'big' || type === 'bigIncrease');

  if (type === 'allowed') {
    this.selectedDiffType = 1; // عجز
    this.form.patchValue({
      isAllowedShortage: true,
      isBigShortage: false,
      isSmallIncrease: false,
      isBigIncrease: false
    });
  }

  if (type === 'big') {
    this.selectedDiffType = 1; // عجز
    this.form.patchValue({
      isAllowedShortage: false,
      isBigShortage: true,
      isSmallIncrease: false,
      isBigIncrease: false
    });
  }

  if (type === 'smallIncrease') {
    this.selectedDiffType = 2; // زيادة
    this.form.patchValue({
      isAllowedShortage: false,
      isBigShortage: false,
      isSmallIncrease: true,
      isBigIncrease: false
    });
  }

  if (type === 'bigIncrease') {
    this.selectedDiffType = 2; // زيادة
    this.form.patchValue({
      isAllowedShortage: false,
      isBigShortage: false,
      isSmallIncrease: false,
      isBigIncrease: true
    });
  }
}


  toggleNetworkReport(): void {
    this.resetReport();

    this.form.patchValue({
      reportType: 'network',
      isAllowedShortage: null,
      isBigShortage: null,
      isSmallIncrease: null,
      isBigIncrease: null
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

  const cityIds = this.form.value.cityIds;

  if (!cityIds || cityIds.length === 0) {
    this.branches = [];
    this.branchIdsControl.setValue([]);
    return;
  }

  this.masterService.getBranchesByCities(cityIds).subscribe({
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
      cityIds: this.form.value.cityIds,
      branchIds: this.branchIdsControl.value || [],
      branchNumber: this.form.value.branchNumber,

      // ⭐ الفلاتر الجديدة
      isAllowedShortage: this.form.value.isAllowedShortage,
      isBigShortage: this.form.value.isBigShortage,
      isSmallIncrease: this.form.value.isSmallIncrease,
      isBigIncrease: this.form.value.isBigIncrease,

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

transferToControl(): void {
  if (!this.report || this.report.length === 0) {
    alert('لا يوجد بيانات لإرسالها إلى الرقابة');
    return;
  }

  if (!this.selectedDiffType) {
    alert('من فضلك اختر نوع الفرق قبل التحويل إلى الرقابة');
    return;
  }

  const userName = this.authService.getUserName();

  const issues = this.report.map(r => ({
    branchId: r.branchId,
    salesDailyId: r.salesDailyId,
    salesDate: r.salesDate,
    differenceAmount: r.difference,

    // ⭐ الاسم الصحيح اللي الباك‑إند مستنيه
    differenceDirection: this.selectedDiffType,

    sentByUser: userName
  }));

  this.controlIssueService.transferIssues(issues).subscribe({
    next: () => alert('تم تحويل البيانات إلى الرقابة بنجاح'),
    error: () => alert('حدث خطأ أثناء تحويل البيانات إلى الرقابة')
  });
}

}
