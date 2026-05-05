import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-target-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-chart.component.html',
  styleUrls: ['./target-chart.component.scss']
})
export class TargetChartComponent implements OnInit {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('percentageChart') percentageChart!: ElementRef;

  targets: any[] = [];
  chart: any;
  percentageChartInstance: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const data = params.get('data');

      if (data) {
        try {
          this.targets = JSON.parse(data);

          setTimeout(() => this.buildChart(), 200);
          setTimeout(() => this.buildPercentageChart(), 300);

        } catch {
          this.targets = [];
        }
      }
    });
  }

  buildChart(): void {
    if (!this.chartCanvas) return;

    const labels = this.targets.map(t => t.branchName);
    const achieved = this.targets.map(t => t.totalAchieved);
    const target = this.targets.map(t => t.totalBranchTarget);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
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
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  buildPercentageChart(): void {
    if (!this.percentageChart) return;

    const labels = this.targets.map(t => t.branchName);
    const percentages = this.targets.map(t => t.achievementPercentage);

    this.percentageChartInstance = new Chart(this.percentageChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'نسبة الإنجاز',
            data: percentages,
            backgroundColor: [
              'rgba(34, 197, 94, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(236, 72, 153, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(14, 165, 233, 0.7)'
            ],
            borderColor: 'white',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  back(): void {
    this.router.navigate(['/branch-targets']);
  }
}
