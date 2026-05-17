import { Component, OnInit } from '@angular/core';
import { BranchDailyDifferenceReportService } from '../../../services/reports/branch-daily-difference-report.service';
import { BranchDailyDifferenceReport, BranchDailyDifferenceReportFilter } from '../../../shared/models/branch-daily-difference-report.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-daily-difference-report',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './branch-daily-difference-report.component.html',
  styleUrls: ['./branch-daily-difference-report.component.css']
})
export class BranchDailyDifferenceReportComponent implements OnInit {

  filter: BranchDailyDifferenceReportFilter = {
    cityId: null,
    branchIds: [],
    isDifferenceLessOrEqual35: null,
    isDifferenceGreaterThan35: null,
    isNetworkReport: false,
    fromDate: null,
    toDate: null
  };

  reportData: BranchDailyDifferenceReport[] = [];
  cities: any[] = [];
  branches: any[] = [];
    // 🔹 الباجينيشن
    currentPage = 1;
    pageSize = 10;
  constructor(private reportService: BranchDailyDifferenceReportService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities() {
    // مؤقتًا بيانات تجريبية
    this.cities = [
      { id: 1, name: 'الرياض' },
      { id: 2, name: 'جدة' },
      { id: 3, name: 'الدمام' }
    ];
  }

  loadBranches() {
    // مؤقتًا بيانات تجريبية حسب المدينة
    if (this.filter.cityId === 1)
      this.branches = [
        { id: 101, name: 'فرع العليا' },
        { id: 102, name: 'فرع الملز' }
      ];
    else if (this.filter.cityId === 2)
      this.branches = [
        { id: 201, name: 'فرع التحلية' },
        { id: 202, name: 'فرع الكورنيش' }
      ];
    else
      this.branches = [];
  }

  selectDiff(type: string) {
    if (type === 'less') {
      this.filter.isDifferenceLessOrEqual35 = true;
      this.filter.isDifferenceGreaterThan35 = false;
      this.filter.isNetworkReport = false;
    } else if (type === 'greater') {
      this.filter.isDifferenceLessOrEqual35 = false;
      this.filter.isDifferenceGreaterThan35 = true;
      this.filter.isNetworkReport = false;
    }
  }

  loadReport() {
    this.reportService.getReport(this.filter).subscribe({
      next: (res: any) => {
        this.reportData = res.data;
      },
      error: (err) => {
        console.error('خطأ أثناء تحميل التقرير:', err);
      }
    });
  }

      get totalPages(): number {
      return Math.ceil(this.reportData.length / this.pageSize);
    }

    get pagedReport() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.reportData.slice(start, start + this.pageSize);
    }

    nextPage(): void {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }

    previousPage(): void {
      if (this.currentPage > 1) this.currentPage--;
    }
}
