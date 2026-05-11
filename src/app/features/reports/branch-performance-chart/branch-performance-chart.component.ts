import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  BranchDailyPerformanceReportService,
  BranchDailyPerformanceReportFilterDto
} from '../../../services/branch-daily-performance-report.service';

Chart.register(...registerables);

@Component({
  selector: 'app-branch-performance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-performance-chart.component.html',
  styleUrls: ['./branch-performance-chart.component.css']
})
export class BranchPerformanceChartComponent implements OnInit {

  chart: any;

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyPerformanceReportService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const filter: BranchDailyPerformanceReportFilterDto = {
        date: params['date'],
        cityId: params['cityId'] ? +params['cityId'] : undefined
      };

      this.loadChart(filter);
    });
  }

  loadChart(filter: BranchDailyPerformanceReportFilterDto): void {
    this.reportService.getChartData(filter).subscribe(data => {
      const labels = data.map((x: any) => x.branchName);
      const percentages = data.map((x: any) => x.achievementPercentage);

      this.chart = new Chart('branchChart', {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'نسبة الإنجاز (%)',
              data: percentages,
              backgroundColor: '#4CAF50'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'تقرير أداء الفروع' }
          }
        }
      });
    });
  }
}
