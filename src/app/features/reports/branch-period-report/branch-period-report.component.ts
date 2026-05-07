import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BranchTargetPeriodReport } from '../../../shared/models/branch-target-period-report.model';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import { MasterDataService } from '../../../services/master-data.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
@Component({
  selector: 'app-branch-period-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent
  ],
  templateUrl: './branch-period-report.component.html',
  styleUrls: ['./branch-period-report.component.css']
})
export class BranchPeriodReportComponent implements OnInit {

  cityOptions: any[] = [];
  branchOptions: any[] = [];

  filterForm!: FormGroup;

  reportData: BranchTargetPeriodReport | null = null;
  // الباجينيشن
  currentPage = 1;
  pageSize = 10; // عدد الصفوف في الصفحة
  totalPages = 1;
  pagedRows: any[] = [];
  constructor(
    private fb: FormBuilder,
    private targetService: BranchDailyTargetService,
    private masterService:MasterDataService,
      private router: Router
  ) {}

  ngOnInit(): void {

    // بناء الفورم
    this.filterForm = this.fb.group({
      cityId: [null],
      branchId: [null],
      fromDate: [null],
      toDate: [null]
    });

    // ضبط تاريخ اليوم
    const today = new Date().toISOString().split('T')[0];
    this.filterForm.patchValue({
      fromDate: today,
      toDate: today
    });

    // تحميل المدن
    this.loadCities();

    // عند تغيير المدينة → تحميل الفروع
    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
      if (cityId) {
        this.loadBranches(cityId);
      } else {
        this.branchOptions = [];
        this.filterForm.patchValue({ branchId: null });
      }
    });
  }

  // تحميل المدن
/*   loadCities() {
    this.targetService.getCities().subscribe((res: any) => {
      this.cityOptions = res;
    });
  }

  // تحميل الفروع حسب المدينة
  loadBranches(cityId: number) {
    this.targetService.getBranchesByCity(cityId).subscribe((res: any) => {
      this.branchOptions = res;
    });
  } */

     loadCities(): void {
    this.masterService.getCities().subscribe({
      next: (res: any) => {
        this.cityOptions = res.data || [];
        this.cityOptions = this.cityOptions.map((c: any) => ({
          id: c.id,
          name: c.cityName
        }));
      }
    });
  }

  loadBranches(cityId: number | null): void {
    this.branchOptions = [];
    this.branchOptions = [];
    this.filterForm.patchValue({ branchId: null });

    if (!cityId) return;

    this.masterService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => {
        this.branchOptions = res.data || [];
        this.branchOptions = this.branchOptions.map((b: any) => ({
          id: b.id,
          name: b.branchName
        }));
      }
    });
  }

  // تحميل التقرير
  loadReport() {
    const { branchId, fromDate, toDate } = this.filterForm.value;

    this.targetService
      .getBranchPeriodReport(branchId, fromDate, toDate)
      .subscribe((res: any) => {
        this.reportData = res;

      this.currentPage = 1; // نرجع لأول صفحة
      this.updatePagination();
      });
  }

  updatePagination() {
  if (!this.reportData?.rows) return;

  const totalRows = this.reportData.rows.length;
  this.totalPages = Math.ceil(totalRows / this.pageSize);

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.pagedRows = this.reportData.rows.slice(start, end);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePagination();
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePagination();
  }
}
exportExcel() {
  if (!this.reportData?.rows?.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Branch Period Report');

  worksheet.addRow(['التاريخ', 'التارجت', 'المنجز', 'نسبة الإنجاز']);

  this.reportData.rows.forEach(r => {
    worksheet.addRow([
      r.targetDate,
      r.totalTarget,
      r.totalAchieved,
      r.achievementPercentage + '%'
    ]);
  });

  worksheet.columns.forEach(col => col.width = 20);

  workbook.xlsx.writeBuffer().then(buffer => {
    saveAs(new Blob([buffer]), 'BranchPeriodReport.xlsx');
  });
}

openChart() {
  const { branchId, fromDate, toDate } = this.filterForm.value;

  if (!branchId || !fromDate || !toDate) {
    // ممكن تحط توست أو رسالة تنبيه
    return;
  }

  this.router.navigate(['/reports/branch-period-chart'], {
    queryParams: {
      branchId,
      fromDate,
      toDate
    }
  });
}

}
