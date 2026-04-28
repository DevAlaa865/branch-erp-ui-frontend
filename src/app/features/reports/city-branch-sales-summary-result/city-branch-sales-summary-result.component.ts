import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-city-branch-sales-summary-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-branch-sales-summary-result.component.html'
})
export class CityBranchSalesSummaryResultComponent implements OnInit {

  filter: any = {};

  rows: any[] = [];
  pagedRows: any[] = [];

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = []; 

  totals = {
    totalSales: 0,
    creditAmount: 0,
    invoicesCount: 0,
    quantitiesCount: 0
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchSalesDailyService,
      private router: Router,

  ) {}

  ngOnInit(): void {
 this.route.queryParams.subscribe(params => {
  const fromDate = params['fromDate'];
  const toDate = params['toDate'];

  if (!fromDate || !toDate) {
    this.router.navigate(['/reports/city-branch-sales-summary']);
    return;
  }

  let cityIds: number[] | null = null;
  if (params['cityIds']) {
    const raw = Array.isArray(params['cityIds']) ? params['cityIds'] : [params['cityIds']];
    cityIds = raw.map((x: any) => Number(x)).filter(x => !isNaN(x));
  }

  const activityTypeId = params['activityTypeId'] ? Number(params['activityTypeId']) : null;
  const branchType = params['branchType'] || 'All';

  this.filter = {
    fromDate,
    toDate,
    cityIds: cityIds && cityIds.length ? cityIds : null,
    activityTypeId,
    branchType
  };

  this.loadData();
});

  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportService.getCityBranchSalesSummary(this.filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || res.success === false) {
          this.errorMessage = res?.message || 'لا توجد بيانات.';
          this.rows = [];
          this.pagedRows = [];
          return;
        }

        this.rows = res.data || [];
        this.calculateTotals();
        this.currentPage = 1;
        this.calculatePagination();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء تحميل البيانات.';
      }
    });
  }

  calculateTotals(): void {
    this.totals.totalSales = this.rows.reduce((a, b) => a + (b.totalSales || 0), 0);
    this.totals.creditAmount = this.rows.reduce((a, b) => a + (b.creditAmount || 0), 0);
    this.totals.invoicesCount = this.rows.reduce((a, b) => a + (b.invoicesCount || 0), 0);
    this.totals.quantitiesCount = this.rows.reduce((a, b) => a + (b.quantitiesCount || 0), 0);
  }

// الباجينيشن الاحترافي

calculatePagination(): void {
  if (!this.rows || this.rows.length === 0) {
    this.pagedRows = [];
    this.totalPages = 1;
    this.pages = [1];
    return;
  }

  this.totalPages = Math.ceil(this.rows.length / this.pageSize);

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.pagedRows = this.rows.slice(start, end);

  this.generatePages();
}

generatePages(): void {
  const pagesToShow = 5; // عدد الأزرار الظاهرة
  let startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
  let endPage = startPage + pagesToShow - 1;

  if (endPage > this.totalPages) {
    endPage = this.totalPages;
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  this.pages = [];
  for (let i = startPage; i <= endPage; i++) {
    this.pages.push(i);
  }
}

goToPage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.calculatePagination();
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.calculatePagination();
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.calculatePagination();
  }
}

goToFirst(): void {
  this.currentPage = 1;
  this.calculatePagination();
}

goToLast(): void {
  this.currentPage = this.totalPages;
  this.calculatePagination();
}

exportExcel(): void {
  if (!this.rows || this.rows.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('City Branch Summary');

  const header = [
    'المدينة',
    'الفرع',
    'إجمالي البيع',
    'الآجل',
    'عدد الفواتير',
    'عدد القطع',
    'المشرف'
  ];

  worksheet.addRow(header);

  this.rows.forEach(row => {
    worksheet.addRow([
      row.cityName,
      row.branchName,
      row.totalSales,
      row.creditAmount,
      row.invoicesCount,
      row.quantitiesCount,
      row.supervisorName
    ]);
  });

  worksheet.columns.forEach(col => col.width = 20);

  workbook.xlsx.writeBuffer().then(buffer => {
    saveAs(new Blob([buffer]), 'CityBranchSalesSummary.xlsx');
  });
}
openChart(): void {
  this.router.navigate(
    ['/reports/city-branch-sales-summary-chart'],
    { queryParams: this.filter }
  );
}
}
