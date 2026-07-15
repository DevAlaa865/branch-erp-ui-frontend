import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-daily-target-season-report-result',
  imports:[CommonModule,FormsModule],
  standalone: true,
  templateUrl: './branch-daily-target-season-report-result.component.html'
})
export class BranchDailyTargetSeasonReportResultComponent implements OnInit {

  reportData: any[] = [];

  // 🔥 الباجينيشن
  currentPage = 1;
  pageSize = 10;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.reportData.length / this.pageSize);
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

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyTargetSeasonReportService
  ) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParams;

    const filter = {
      fromDate: query['fromDate'],
      toDate: query['toDate'],
      cityIds: query['cityIds']?.split(',').map(Number),
      branchIds: query['branchIds'] ? [Number(query['branchIds'])] : []
    };

    this.reportService.getReport(filter).subscribe(res => {
      this.reportData = res;
    });
  }
}
