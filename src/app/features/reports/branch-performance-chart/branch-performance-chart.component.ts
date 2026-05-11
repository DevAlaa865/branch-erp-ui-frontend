import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  BranchDailyPerformanceReportService,
  BranchDailyPerformanceReportFilterDto
} from '../../../services/branch-daily-performance-report.service';
import { MasterDataService } from '../../../services/master-data.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-branch-performance-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-performance-chart.component.html',
  styleUrls: ['./branch-performance-chart.component.css']
})
export class BranchPerformanceChartComponent implements OnInit {

  branches: any[] = [];
  cities: any[] = [];
  branchFilterList: any[] = [];

  barChart: any = null;
  pieChart: any = null;

  totalTarget = 0;
  totalAchieved = 0;
  avgAchievement = 0;

  maxBranch: any;
  minBranch: any;

  filter: BranchDailyPerformanceReportFilterDto = {
    date: '',
    cityId: undefined,
    branchId: undefined
  };

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyPerformanceReportService,
    private masterService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filter.date = params['date'] || this.todayAsString();
      this.filter.cityId = params['cityId'] ? +params['cityId'] : undefined;
      this.filter.branchId = params['branchId'] ? +params['branchId'] : undefined;

      this.loadCities();
      if (this.filter.cityId) this.loadBranchesByCity(this.filter.cityId);

      this.loadChart(this.filter);
    });
  }

  todayAsString(): string {
    const d = new Date();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  loadCities(): void {
    this.masterService.getCities().subscribe({
      next: (res) => this.cities = res.data || [],
      error: () => this.cities = []
    });
  }

  onCityChange(): void {
    if (this.filter.cityId) {
      this.loadBranchesByCity(this.filter.cityId);
    } else {
      this.branchFilterList = [];
      this.filter.branchId = undefined;
    }
  }

  loadBranchesByCity(cityId: number): void {
    this.masterService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => this.branchFilterList = res.data || res || [],
      error: () => this.branchFilterList = []
    });
  }

  reloadChart(): void {
    this.loadChart(this.filter);
  }

  loadChart(filter: BranchDailyPerformanceReportFilterDto): void {
    this.loading = true;

    this.reportService.getChartData(filter).subscribe({
      next: (data) => {
        this.branches = data || [];

        const labels = this.branches.map((x: any) => x.branchName);
        const targets = this.branches.map((x: any) => x.targetAmount || 0);
        const achieved = this.branches.map((x: any) => x.achievedAmount || 0);
        const percentages = this.branches.map((x: any) => x.achievementPercentage || 0);

        this.totalTarget = targets.reduce((a, b) => a + b, 0);
        this.totalAchieved = achieved.reduce((a, b) => a + b, 0);
        this.avgAchievement = this.branches.length
          ? Math.round(
              (this.branches.reduce((a, b) => a + (b.achievementPercentage || 0), 0) /
                this.branches.length) * 100
            ) / 100
          : 0;

        // أعلى وأقل فرع
        this.maxBranch = this.branches.reduce((a, b) =>
          a.achievementPercentage > b.achievementPercentage ? a : b
        );
        this.minBranch = this.branches.reduce((a, b) =>
          a.achievementPercentage < b.achievementPercentage ? a : b
        );

        // ألوان المنجز
        const achievedColors = percentages.map((p: number) => {
          if (p >= 100) return 'rgba(234, 179, 8, 0.9)';
          if (p >= 80) return 'rgba(234, 179, 8, 0.9)';
          return 'rgba(234, 179, 8, 0.9)';
        });

        if (this.barChart) this.barChart.destroy();
        if (this.pieChart) this.pieChart.destroy();

        const barCanvas: any = document.getElementById('branchBarChart');
        const barCtx = barCanvas.getContext('2d');

        // ============================
        //      BAR CHART
        // ============================
        this.barChart = new Chart(barCtx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'التارجت',
                data: targets,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                datalabels: { display: false } // حذف الأرقام داخل الأعمدة
              },
              {
                label: 'المنجز',
                data: achieved,
                backgroundColor: achievedColors,
                datalabels: { display: false } // حذف الأرقام داخل الأعمدة
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' }
            },
            scales: {
              x: { ticks: { autoSkip: false, maxRotation: 0 } }
            }
          },
          plugins: [
            // 🔵 رقم التارجت فوق العمود الأزرق
            {
              id: 'targetLabels',
              afterDatasetsDraw: (chart: any) => {
                const ctx = chart.ctx;
                chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
                  const value = targets[index];
                  ctx.save();
                  ctx.fillStyle = '#1e3a8a';
                  ctx.font = 'bold 12px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.fillText(value.toLocaleString(), bar.x, bar.y - 10);
                  ctx.restore();
                });
              }
            },

            // 🟢 رقم المنجز فوق العمود الملون
            {
              id: 'achievedLabels',
              afterDatasetsDraw: (chart: any) => {
                const ctx = chart.ctx;
                chart.getDatasetMeta(1).data.forEach((bar: any, index: number) => {
                  const value = achieved[index];
                  ctx.save();
                  ctx.fillStyle = '#065f46';
                  ctx.font = 'bold 12px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.fillText(value.toLocaleString(), bar.x, bar.y - 10);
                  ctx.restore();
                });
              }
            },

            // 🟡 نسبة الإنجاز تحت اسم الفرع
            {
  id: 'percentageLabelsBelow',
  afterDatasetsDraw: (chart: any) => {
    const ctx = chart.ctx;
    const chartHeight = chart.height; // 👈 ارتفاع الكانفاس بالكامل

    chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
      const percent = percentages[index] + '%';
      const x = bar.x;

      ctx.save();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      // 👇 نزّلنا النسبة تحت اسم الفرع بوضوح
      ctx.fillText(percent, x, chartHeight - 25);

      ctx.restore();
                });
              }
            }
          ]
        });

        // ============================
        //      PIE CHART
        // ============================
        const pieCanvas: any = document.getElementById('branchPieChart');
        const pieCtx = pieCanvas.getContext('2d');

        this.pieChart = new Chart(pieCtx, {
          type: 'doughnut',
          data: {
            labels: ['إجمالي التارجت', 'إجمالي المنجز'],
            datasets: [
              {
                data: [this.totalTarget, this.totalAchieved],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            cutout: '60%',
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  downloadBarChart(): void {
    if (!this.barChart) return;
    const link = document.createElement('a');
    link.href = this.barChart.toBase64Image();
    link.download = `BranchBarChart_${this.filter.date}.png`;
    link.click();
  }

  downloadPieChart(): void {
    if (!this.pieChart) return;
    const link = document.createElement('a');
    link.href = this.pieChart.toBase64Image();
    link.download = `BranchPieChart_${this.filter.date}.png`;
    link.click();
  }
}
