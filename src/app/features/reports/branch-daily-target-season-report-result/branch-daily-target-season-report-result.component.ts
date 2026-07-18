import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-branch-daily-target-season-report-result',
  standalone: true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './branch-daily-target-season-report-result.component.html'
})
export class BranchDailyTargetSeasonReportResultComponent implements OnInit {

  form!: FormGroup;

  reportData: any[] = [];
  branchesList: any[] = [];

  filter: any;

  // ⭐ السلايدز
  selectedSlides: any[] = [];
  currentSlideIndex = 0;
  showSlide = false;
  autoSlideInterval: any;

  // ⭐ الباجينيشن
  currentPage = 1;
  pageSize = 14;

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyTargetSeasonReportService,
    private masterService: MasterDataService
  ) {}

  ngOnInit(): void {

    // ⭐ إنشاء الـ FormGroup
    this.form = new FormGroup({
      date: new FormControl(null),
      branchId: new FormControl(null),
      achievement: new FormControl(null)
    });

    const query = this.route.snapshot.queryParams;

    const filter = {
      fromDate: query['fromDate'],
      toDate: query['toDate'],
      cityIds: query['cityIds']?.split(',').map(Number),
      branchIds: query['branchIds'] ? [Number(query['branchIds'])] : []
    };

    // ⭐ تحميل التقرير
    this.reportService.getReport(filter).subscribe(res => {
      this.reportData = res;

      // ⭐ تحميل الفروع
      this.masterService.getBranches().subscribe(branchRes => {

        const branches = branchRes.data || branchRes || [];
        this.branchesList = branches;

        this.reportData = this.reportData.map(r => {
          const match = branches.find((b: any) => b.id === r.branchId);
          return {
            ...r,
            branchId: Number(r.branchId),   // ⭐ إصلاح الفلترة
            branchNumber: match ? match.branchNumber : null,
            date: filter.fromDate
          };
        });

      });

    });

    this.filter = filter;
  }

  // ⭐ دالة الفلترة الأساسية
  get filteredData() {

    const selectedDate = this.form.value.date;
    const selectedBranch = this.form.value.branchId;
    const selectedAchievement = this.form.value.achievement;

    return this.reportData.filter(r => {

      const matchDate =
        selectedDate ? r.date === selectedDate : true;

      const matchBranch =
        selectedBranch ? r.branchId === selectedBranch : true;

      const matchAchievement =
        selectedAchievement === 'low'
          ? r.achievementPercentage < 85
          : selectedAchievement === 'mid'
            ? r.achievementPercentage >= 85 && r.achievementPercentage < 100
            : selectedAchievement === 'high'
              ? r.achievementPercentage >= 100
              : true;

      return matchDate && matchBranch && matchAchievement;
    });
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ⭐ زر عرض النتائج
  applyFilters() {
    console.log("🔍 الفلاتر المختارة:");
    console.log("اليوم:", this.form.value.date);
    console.log("الفرع:", this.form.value.branchId);
    console.log("نسبة الإنجاز:", this.form.value.achievement);

    const result = this.filteredData;

    console.log("📊 عدد النتائج بعد الفلترة:", result.length);
    console.log("📄 النتائج:", result);

    this.currentPage = 1;
  }

  // ⭐ مجموعات الأداء
  get excellentBranches() {
    return this.reportData.filter(r => r.achievementPercentage >= 100);
  }

  get veryGoodBranches() {
    return this.reportData.filter(r => r.achievementPercentage >= 85 && r.achievementPercentage < 100);
  }

  get needsImprovementBranches() {
    return this.reportData.filter(r => r.achievementPercentage < 85);
  }

  // ⭐ فتح السلايدز
  openSlides(type: 'low' | 'mid' | 'high') {
    if (type === 'low') {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage < 85);
    } else if (type === 'mid') {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage >= 85 && r.achievementPercentage < 100);
    } else {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage >= 100);
    }

    this.currentSlideIndex = 0;
    this.showSlide = true;

    this.startAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (this.selectedSlides.length > 0) {
        this.currentSlideIndex =
          (this.currentSlideIndex + 1) % this.selectedSlides.length;
      }
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  nextSlide() {
    if (this.selectedSlides.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex + 1) % this.selectedSlides.length;
    }
  }

  prevSlide() {
    if (this.selectedSlides.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.selectedSlides.length) %
        this.selectedSlides.length;
    }
  }

  closeSlides() {
    this.showSlide = false;
    this.stopAutoSlide();
  }

exportExcel() {

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Season Daily Target', {
    views: [
      {
        rightToLeft: true,
        state: 'frozen',
        ySplit: 2
      }
    ]
  });

  //==============================
  // عنوان التقرير
  //==============================

  sheet.mergeCells('A1:D1');

  const title = sheet.getCell('A1');

  title.value = `تقرير التارجت اليومي - Season (${this.form.value.date || this.filter.fromDate})`;

  title.font = {
    name: 'Arial',
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  title.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1F4E78' }
  };

  sheet.getRow(1).height = 28;

  //==============================
  // الهيدر
  //==============================

  const header = sheet.addRow([
    'الفرع',
    'التارجت',
    'المتحقق',
    'نسبة الإنجاز'
  ]);

  header.height = 24;

  header.eachCell(cell => {

    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 12
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F75B5' }
    };

    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

  });

  //==============================
  // البيانات
  //==============================

  this.filteredData.forEach(r => {

    const row = sheet.addRow([

      r.branchName,

      r.totalTargetAmount,

      r.totalAchievedAmount,

      r.achievementPercentage / 100

    ]);

    row.height = 22;

    row.eachCell(cell => {

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

    });

    // تنسيق الأرقام

    row.getCell(2).numFmt = '#,##0.00';

    row.getCell(3).numFmt = '#,##0.00';

    row.getCell(4).numFmt = '0.00%';

    // تلوين الصفوف التى لا يوجد بها مبيعات

    if (r.totalAchievedAmount === 0) {

      row.eachCell(cell => {

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2CC' }
        };

      });

    }

  });

  //==============================
  // عرض الأعمدة
  //==============================

  sheet.columns = [

    { width: 35 },

    { width: 18 },

    { width: 18 },

    { width: 18 }

  ];

  //==============================
  // Auto Filter
  //==============================

  sheet.autoFilter = {
    from: 'A2',
    to: 'D2'
  };

  //==============================
  // حفظ الملف
  //==============================

  workbook.xlsx.writeBuffer().then(buffer => {

    saveAs(
      new Blob([buffer]),
      'SeasonDailyTarget.xlsx'
    );

  });

}

exportPDF(): void {

  if (!this.filteredData || this.filteredData.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');

  (doc as any).addFont(
    'assets/fonts/Amiri-Regular.ttf',
    'Amiri',
    'normal'
  );

  doc.setFont('Amiri');

  const headers = [
    'تنبيه',
    'نسبة الإنجاز',
    'المتحقق',
    'التارجت',
    'الفرع'
  ];

  const totalColumns = headers.length;

  const pageWidth = doc.internal.pageSize.getWidth() - 20;
  const columnWidth = pageWidth / totalColumns;
  const colWidths = Array(totalColumns).fill(columnWidth);

  // =============================
  // رسم الهيدر
  // =============================
  const drawHeader = () => {

    doc.setFont('Amiri');
    doc.setFontSize(16);

    const title =
      `تقرير التارجت اليومي - Season (${this.form.value.date || this.filter.fromDate})`;

    doc.text(
      title,
      doc.internal.pageSize.getWidth() / 2,
      12,
      { align: 'center' }
    );

    let x = 10;

    headers.forEach((header, index) => {

      doc.setFillColor(41, 128, 185);
      doc.rect(x, 18, colWidths[index], 14, 'F');

      doc.setTextColor(255);
      doc.setFontSize(10);

      const lines = doc.splitTextToSize(
        header,
        colWidths[index] - 2
      );

      doc.text(
        lines,
        x + colWidths[index] / 2,
        25,
        {
          align: 'center',
          baseline: 'middle'
        } as any
      );

      x += colWidths[index];

    });

    doc.setTextColor(0);

  };

  const body = this.filteredData.map(r => [

    r.totalAchievedAmount === 0
      ? 'لا توجد مبيعات'
      : '',

    `${r.achievementPercentage}%`,

    r.totalAchievedAmount?.toFixed(2),

    r.totalTargetAmount?.toFixed(2),

    r.branchName

  ]);

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

      cellPadding: 1,

      halign: 'center',

      valign: 'middle',

      overflow: 'linebreak',

      lineWidth: 0.1,

      lineColor: [0, 0, 0]

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

      if (data.row.index >= 0) {

        const rawRow = data.row.raw as any[];

        const achieved = parseFloat(rawRow[2]);

        if (achieved === 0) {

          data.cell.styles.fillColor = [255, 243, 205];

        }

      }

    },

    didDrawPage: () => {

      drawHeader();

    }

  });

  doc.save('SeasonDailyTarget.pdf');

}

}
