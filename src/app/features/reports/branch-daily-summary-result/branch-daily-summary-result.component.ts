import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import { ShortByTypePipe } from '../branch-daily-summary-report/short-by-type.pipe';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BranchShortageSummary {
  shortageTypeId: number;
  shortageTypeName: string;
  amount: number;
}

interface BranchDailySummaryRow {
  branchId: number;
  branchNumber:number;
  branchName: string;
  cashAmount: number;
  networkAmount: number;
  creditAmount: number;
  totalSales: number;
  grandTotal: number;
  difference: number;

  totalShortageAmount: number;
  shortages: BranchShortageSummary[];
}

interface BranchDailySummaryFilter {
  fromDate: string;
  toDate: string;
  cityIds?: number[] | null;
  activityTypeId?: number | null;
  branchType: string;
  onlyWithShortage: boolean;
}

@Component({
  selector: 'app-branch-daily-summary-result',
  standalone: true,
  imports: [CommonModule, ShortByTypePipe],
  templateUrl: './branch-daily-summary-result.component.html',
  styleUrls: ['./branch-daily-summary-result.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  
})
export class BranchDailySummaryResultComponent implements OnInit {

  rows: BranchDailySummaryRow[] = [];
  shortageTypes: { id: number; name: string }[] = [];

  isLoading = false;
  errorMessage = '';
  selectedRowId: number | null = null;

  openedRows: number[] = [];
  pagedRows: BranchDailySummaryRow[] = [];
  pageSize = 12;
  currentPage = 1;
  totalPages = 1;

  filter!: BranchDailySummaryFilter;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private branchSalesDailyService: BranchSalesDailyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];

      if (!fromDate || !toDate) {
        this.router.navigate(['/reports/branch-daily-summary']);
        return;
      }

      const branchType = params['branchType'] || 'All';
      const onlyWithShortage = params['onlyWithShortage'] === 'true' || params['onlyWithShortage'] === true;

      let cityIds: number[] | null = null;
      if (params['cityIds']) {
        const raw = Array.isArray(params['cityIds']) ? params['cityIds'] : [params['cityIds']];
        cityIds = raw.map((x: any) => Number(x)).filter(x => !isNaN(x));
      }

      const activityTypeId = params['activityTypeId'] ? Number(params['activityTypeId']) : null;

      this.filter = {
        fromDate,
        toDate,
        branchType,
        onlyWithShortage,
        cityIds: cityIds && cityIds.length ? cityIds : null,
        activityTypeId
      };

      this.loadReport();
    });
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.rows = [];
    this.shortageTypes = [];

    this.branchSalesDailyService.getSummaryReport(this.filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || res.success === false) {
          this.errorMessage = res?.message || 'لم يتم العثور على بيانات للتقرير.';
          return;
        }

        this.rows = res.data || [];

        const map = new Map<number, string>();

        this.rows.forEach((row: any) => {
          (row.shortages || []).forEach((s: any) => {
            if (!map.has(s.shortageTypeId)) {
              map.set(s.shortageTypeId, s.shortageTypeName);
            }
          });
        });

        this.shortageTypes = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

        this.currentPage = 1;
        this.calculatePagination();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء جلب بيانات التقرير.';
      }
    });
  }



openDailyDetails(row: BranchDailySummaryRow) {

  // لو الصف مش موجود → ضيفه
  if (!this.openedRows.includes(row.branchId)) {
    this.openedRows.push(row.branchId);
  }

  const date = this.filter.fromDate;

  const url = this.router.serializeUrl(
    this.router.createUrlTree(
      ['/revenue-management/daily-sales-inquiry'],
      {
        queryParams: {
          branchId: row.branchId,
          salesDate: date
        }
      }
    )
  );

  window.open(url, '_blank');
}




  calculatePagination(): void {
    if (!this.rows || this.rows.length === 0) {
      this.pagedRows = [];
      this.totalPages = 1;
      return;
    }

    this.totalPages = Math.ceil(this.rows.length / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.pagedRows = this.rows.slice(startIndex, endIndex);
  }

  trackByBranch(index: number, item: BranchDailySummaryRow) {
    return item.branchId;
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

  exportToExcel(): void {
    if (!this.rows || this.rows.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Branch Daily Summary');

    const header: string[] = [
      'رقم الفرع',
      'الفرع',
      'نقدية',
      'شبكة',
      'آجل',
      'إجمالي البيع',
      'الإجمالي الكلي',
      'الفرق',
      'قيمة العجز'
    ];

    this.shortageTypes.forEach(st => header.push(st.name));

    worksheet.addRow(header);

    this.rows.forEach(row => {
      const rowData: any[] = [
        row.branchNumber,
        row.branchName,
        row.cashAmount,
        row.networkAmount,
        row.creditAmount,
        row.totalSales,
        row.grandTotal,
        row.difference,
        row.totalShortageAmount
      ];

      this.shortageTypes.forEach(st => {
        const found = row.shortages?.find(x => x.shortageTypeId === st.id);
        rowData.push(found ? found.amount : 0);
      });

      worksheet.addRow(rowData);
    });

    worksheet.columns.forEach(col => col.width = 18);

    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), 'BranchDailySummary.xlsx');
    });
  }

exportToPdf(): void {
  if (!this.rows || this.rows.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');

  (doc as any).addFont(
    'assets/fonts/Amiri-Regular.ttf',
    'Amiri',
    'normal'
  );

  doc.setFont('Amiri');

  const headers = [
    'رقم الفرع',
    'الفرع',
    'نقدية',
    'شبكة',
    'آجل',
    'إجمالي البيع',
    'الإجمالي الكلي',
    'الفرق',
    'قيمة العجز',
    ...this.shortageTypes.map(x => x.name)
  ];

  const totalColumns = headers.length;

  const pageWidth =
    doc.internal.pageSize.getWidth() - 20;

  const columnWidth =
    pageWidth / totalColumns;

  const colWidths =
    Array(totalColumns).fill(columnWidth);

  const drawHeader = () => {

    doc.setFont('Amiri');

    doc.setFontSize(14);
  const title =
  `تقرير يوميات الفروع المجمع (${this.filter.fromDate})`;
  
    doc.text(
      title,

      doc.internal.pageSize.getWidth() / 2,
      12,
      { align: 'center' }
    );

    let x = 10;

    headers.forEach((header, index) => {

      doc.setFillColor(41, 128, 185);
      doc.rect(
        x,
        18,
        colWidths[index],
        14,
        'F'
      );

      doc.setTextColor(255);
      doc.setFontSize(7);

      const lines = doc.splitTextToSize(
        header,
        colWidths[index] - 2
      );

      doc.text(
        lines,
        x + colWidths[index] / 2,
        23,
        {
          align: 'center',
          baseline: 'middle'
        } as any
      );

      x += colWidths[index];
    });

    doc.setTextColor(0);
  };

  const body = this.rows.map(row => {

    const rowData: any[] = [
      row.branchNumber ?? '',
      row.branchName ?? '',
      row.cashAmount?.toFixed(2) ?? '0.00',
      row.networkAmount?.toFixed(2) ?? '0.00',
      row.creditAmount?.toFixed(2) ?? '0.00',
      row.totalSales?.toFixed(2) ?? '0.00',
      row.grandTotal?.toFixed(2) ?? '0.00',
      row.difference?.toFixed(2) ?? '0.00',
      row.totalShortageAmount?.toFixed(2) ?? '0.00'
    ];

    this.shortageTypes.forEach(st => {

      const found = row.shortages?.find(
        x => x.shortageTypeId === st.id
      );

      rowData.push(
        (found?.amount ?? 0).toFixed(2)
      );
    });

    return rowData;
  });

  const columnStyles: Record<number, any> = {};

  for (let i = 0; i < totalColumns; i++) {

    columnStyles[i] = {
      cellWidth: columnWidth,
      halign: 'center',
      valign: 'middle'
    };
  }

  autoTable(doc, {
    body,
    startY: 35,
    showHead: 'never',
    theme: 'grid',

    styles: {
      font: 'Amiri',
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: 'linebreak'
    },

    columnStyles,

    margin: {
      top: 35,
      left: 10,
      right: 10
    },

    tableWidth: 'auto',

    didParseCell: function (data) {
      data.cell.styles.font = 'Amiri';
    },

    didDrawPage: () => {
      drawHeader();
    }
  });

  doc.save('BranchDailySummary.pdf');
}
  
}
