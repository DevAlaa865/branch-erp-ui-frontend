import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesSummaryReportService } from '../../../../services/reports/sales-summary-report.service';
import { SalesSummaryReportItem, SalesSummaryReportFilter } from '../../../../shared/models/sales-summary-report.model';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  loading = false;

  // ترتيب الفروع من ملف JSON
  branchOrder: any[] = [];

  // البيانات الأصلية
  items: SalesSummaryReportItem[] = [];

  // البيانات المعروضة بعد الباجينيشن
  pagedItems: SalesSummaryReportItem[] = [];

  // الفلتر القادم من شاشة الفلاتر
  filter!: SalesSummaryReportFilter;

  // إعدادات الباجينيشن
  pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private router: Router,
    private reportService: SalesSummaryReportService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    // 🔥 تحميل ترتيب الفروع من JSON
    this.http.get('/assets/branch-order.json').subscribe(order => {
      this.branchOrder = order as any[];
      this.initializeReport();
    });
  }

  initializeReport() {
    const params = new URLSearchParams(window.location.search);

    const fromDate = params.get('fromDate');
    const toDate = params.get('toDate');

    if (!fromDate || !toDate) {
      this.router.navigate(['/reports/sales-summary-report-filters']);
      return;
    }

    this.filter = {
      fromDate: fromDate,
      toDate: toDate,
      regionId: params.get('regionId') ? Number(params.get('regionId')) : null,
      cityId: params.get('cityId') ? Number(params.get('cityId')) : null,
      branchId: params.get('branchId') ? Number(params.get('branchId')) : null
    };

    this.loadReport();
  }
loadReport() {
  this.loading = true;

  this.reportService.getReport(this.filter).subscribe({
    next: res => {
      const apiItems = res.data || [];

      // 🔥 1) نعمل Map للفروع اللي رجعت من الـ API
      const existingBranches = new Map(apiItems.map(x => [x.branchNumber, x]));

      // 🔥 2) نعمل Map لأسماء الفروع اللي رجعت من الـ API
      const branchNamesMap = new Map(apiItems.map(x => [x.branchNumber, x.branchName]));

      // 🔥 3) نضيف الفروع الناقصة من JSON
      this.items = this.branchOrder.map(order => {
        const found = existingBranches.get(order.branchNumber);

        if (found) {
          return {
            ...found,
            serial: order.serial,
            noSales: false
          };
        }

        // 🔥 اسم الفرع الحقيقي لو موجود في API
        const realName = branchNamesMap.get(order.branchNumber) || `فرع ${order.branchNumber}`;

        const emptyItem: SalesSummaryReportItem = {
          serial: order.serial,
          branchId: 0,
          branchNumber: order.branchNumber,
          branchName: realName, // ← هنا الحل
          totalSales: 0,
          totalReturns: 0,
          netSales: 0,
          invoiceCount: 0,
          quantityCount: 0,
          activityType: '',
          noSales: true
        };

        return emptyItem;
      });

      // 🔥 4) ترتيب حسب المسلسل
      this.items.sort((a, b) => a.serial - b.serial);

      // 🔥 5) تحديث الباجينيشن
      this.currentPage = 1;
      this.updatePagination();
      this.loading = false;
    },
    error: err => {
      console.error('Error loading report', err);
      this.loading = false;
    }
  });
}




  updatePagination() {
    this.totalPages = Math.ceil(this.items.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedItems = this.items.slice(start, end);
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

  get totalNetSales(): number {
    return this.items.reduce((sum, x) => sum + x.netSales, 0);
  }

  get totalInvoices(): number {
    return this.items.reduce((sum, x) => sum + x.invoiceCount, 0);
  }

  get totalQuantities(): number {
    return this.items.reduce((sum, x) => sum + x.quantityCount, 0);
  }

  getActivityName(type: any): string {
    const t = +type;
    switch (t) {
      case 1: return 'إكسسوار';
      case 2: return 'ملابس';
      default: return 'غير محدد';
    }
  }

getRowClass(row: any) {
  const classes = [];

  // 🔥 الصف اللي مفيهوش مبيعات
if (row.noSales) {
  classes.push('bg-orange-50', 'border-l-4', 'border-orange-400');
  return classes;
}
  // باقي التنسيقات للفروع العادية
  if (+row.activityType === 1) classes.push('bg-blue-50');
  if (+row.activityType === 2) classes.push('bg-emerald-50');

  const maxSales = Math.max(...this.items.map(x => x.netSales));
  if (row.netSales === maxSales) classes.push('bg-yellow-100');

  const minSales = Math.min(...this.items.map(x => x.netSales));
  if (row.netSales === minSales) classes.push('bg-red-100');

  const maxReturns = Math.max(...this.items.map(x => x.totalReturns));
  if (row.totalReturns === maxReturns) classes.push('bg-rose-100');

  return classes;
}



  printReport() {
    if (!this.items || this.items.length === 0) return;

    const popup = window.open('', '_blank', 'width=1000,height=800');
    if (!popup) return;

    let tableRows = '';

    this.items.forEach(row => {
      tableRows += `
        <tr>
          <td>${row.branchNumber}</td>
          <td>${row.branchName}</td>
          <td>${row.totalSales?.toFixed(2)}</td>
          <td>${row.totalReturns?.toFixed(2)}</td>
          <td>${row.netSales?.toFixed(2)}</td>
          <td>${row.invoiceCount}</td>
          <td>${row.quantityCount}</td>
          <td>${this.getActivityName(row.activityType)}</td>
        </tr>
      `;
    });

    popup.document.open();
    popup.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة التقرير</title>
          <style>
            body { font-family: Tahoma; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #eee; }

            @media print {
              table { page-break-after: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              td { page-break-inside: avoid; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>
          <h2 style="text-align:center">تقرير المبيعات للفروع</h2>

          <table>
            <thead>
              <tr>
              <th>المسلسل</th>
                <th>رقم الفرع</th>
                <th>الفرع</th>
                <th>إجمالي البيع</th>
                <th>المرتجعات</th>
                <th>صافي البيع</th>
                <th>عدد الفواتير</th>
                <th>عدد القطع</th>
                <th>نوع النشاط</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    popup.document.close();
    popup.print();
  }

  exportExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Summary');

    worksheet.addRow([
       'المسلسل',
       'رقم الفرع',
      'اسم الفرع',
      'إجمالي البيع',
      'المرتجعات',
      'صافي البيع',
      'عدد الفواتير',
      'عدد القطع',
      'نوع النشاط'
    ]);

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' }
      };
    });

    this.items.forEach(row => {
      worksheet.addRow([
         row.serial,
         row.branchNumber,
        row.branchName,
        row.totalSales,
        row.totalReturns,
        row.netSales,
        row.invoiceCount,
        row.quantityCount,
        this.getActivityName(row.activityType)
      ]);
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), 'SalesSummaryReport.xlsx');
    });
  }
}
