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
