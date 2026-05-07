import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';

@Component({
  selector: 'app-branch-period-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-period-chart.component.html',
  styleUrls: ['./branch-period-chart.component.scss']
})
export class BranchPeriodChartComponent implements OnInit {
cityName!: string;
branchName!: string;
supervisorName!: string;

  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  @ViewChild('percentageChartCanvas') percentageChartCanvas!: ElementRef;

  barChart: any;
  percentageChart: any;

  rows: any[] = [];

  branchId!: number;
  fromDate!: string;
  toDate!: string;

  colors: string[] = [
    'rgba(34, 197, 94, 0.7)',
    'rgba(59, 130, 246, 0.7)',
    'rgba(249, 115, 22, 0.7)',
    'rgba(236, 72, 153, 0.7)',
    'rgba(168, 85, 247, 0.7)',
    'rgba(14, 165, 233, 0.7)',
    'rgba(250, 204, 21, 0.7)',
    'rgba(163, 230, 53, 0.7)',
    'rgba(244, 63, 94, 0.7)',
    'rgba(125, 211, 252, 0.7)'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private targetService: BranchDailyTargetService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.branchId = Number(params.get('branchId'));
      this.fromDate = params.get('fromDate') ?? '';
      this.toDate = params.get('toDate') ?? '';

      if (this.branchId && this.fromDate && this.toDate) {
        this.loadReport();
      }
    });
  }

loadReport(): void {
  this.targetService
    .getBranchPeriodReport(this.branchId, this.fromDate, this.toDate)
    .subscribe((res: any) => {

      this.rows = res.rows || [];

      // بيانات العنوان
      this.cityName = res.cityName;
      this.branchName = res.branchName;
      this.supervisorName = res.supervisorName;

      // بناء الشارتات
      setTimeout(() => this.buildBarChart(), 200);
      setTimeout(() => this.buildPercentageChart(), 300);
    });
}


  // ============================
  //   الشارت الأول (Bar Chart)
  // ============================
  buildBarChart(): void {
    if (!this.barChartCanvas) return;

    const labels = this.rows.map(r => r.targetDate);
    const achieved = this.rows.map(r => r.totalAchieved);
    const target = this.rows.map(r => r.totalTarget);

    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'المنجز',
            data: achieved,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2
          },
          {
            label: 'التارجت',
            data: target,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // ============================
  //   الشارت الثاني (Doughnut)
  // ============================
  buildPercentageChart(): void {
    if (!this.percentageChartCanvas) return;

    const percentages = this.rows.map(r => r.achievementPercentage);

    this.percentageChart = new Chart(this.percentageChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.rows.map(r => r.targetDate),
        datasets: [
          {
            label: 'نسبة الإنجاز',
            data: percentages,
            backgroundColor: this.colors,
            borderColor: 'white',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  back(): void {
    this.router.navigate(['/reports/branch-period-report']);
  }
}
