import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';

import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

import { MasterDataService } from '../../../services/master-data.service';

import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { BranchDailyTargetSeasonChartDto, BranchDailyTargetSeasonReportFilterDto } from '../../../shared/models/branch-daily-target-season.model';


Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-branch-daily-target-season-chart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent
  ],
  templateUrl: './branch-daily-target-season-chart.component.html',
  styleUrls: ['./branch-daily-target-season-chart.component.css']
})
export class BranchDailyTargetSeasonChartComponent
implements OnInit, OnDestroy {

  @ViewChild('chartCanvas')


  chartCanvas!: ElementRef<HTMLCanvasElement>;
  currentPage = 1;
  pageSize = 10;
  chart: Chart | null = null;

  filterForm!: FormGroup;

  loading = false;

  noData = false;

  fromDate = '';

  toDate = '';

  chartData: BranchDailyTargetSeasonChartDto[] = [];

  cities: any[] = [];

  branches: any[] = [];

  filteredCities: any[] = [];

  filteredBranches: any[] = [];

  totalTarget = 0;

  totalAchieved = 0;

  averageAchievement = 0;

  totalBranches = 0;

  constructor(

    private fb: FormBuilder,

    private route: ActivatedRoute,

    private masterData: MasterDataService,

    private reportService: BranchDailyTargetSeasonReportService

  ) { }

  ngOnInit(): void {

    const query = this.route.snapshot.queryParams;

    this.fromDate = query['fromDate'];

    this.toDate = query['toDate'];

    this.buildForm();

    this.loadMasterData();

  }

  ngOnDestroy(): void {

    this.chart?.destroy();

  }

  buildForm(): void {

    this.filterForm = this.fb.group({

      cityId: [[]],

      branchId: [null]

    });

    this.filterForm.get('cityId')?.valueChanges.subscribe(ids => {

      this.onCityChanged(ids);

    });

    this.filterForm.get('branchId')?.valueChanges.subscribe(() => {

      this.loadChart();

    });

  }

  loadMasterData(): void {

    this.masterData.getCities().subscribe(res => {

      if (!res.success) return;

      this.cities = res.data.map(c => ({

        id: c.id,

        label: c.cityName

      }));

      this.filteredCities = [...this.cities];

    });

    this.masterData.getBranches().subscribe(res => {

      if (!res.success) return;

      this.branches = res.data.map((b: any) => ({

        id: b.id,

        label: b.branchName,

        cityId: b.cityId

      }));

      this.filteredBranches = [...this.branches];

      this.loadChart();

    });

  }
    onCityChanged(cityIds: number[] | null): void {

    if (!cityIds || cityIds.length === 0) {

      this.filteredBranches = [...this.branches];

      this.filterForm.patchValue(
        {
          branchId: null
        },
        {
          emitEvent: false
        }
      );

      this.loadChart();

      return;

    }

    this.filteredBranches = this.branches.filter(branch =>
      cityIds.includes(branch.cityId)
    );

    const selectedBranch = this.filterForm.value.branchId;

    if (
      selectedBranch &&
      !this.filteredBranches.some(x => x.id === selectedBranch)
    ) {

      this.filterForm.patchValue(
        {
          branchId: null
        },
        {
          emitEvent: false
        }
      );

    }

    this.loadChart();

  }

loadChart(): void {

  this.loading = true;
  this.noData = false;

  const form = this.filterForm.value;

  const branchIds =
    Array.isArray(form.branchId)
      ? form.branchId
      : form.branchId
      ? [form.branchId]
      : undefined;

  const filter: BranchDailyTargetSeasonReportFilterDto = {
    fromDate: this.fromDate,
    toDate: this.toDate,
    cityIds: form.cityId?.length ? form.cityId : undefined,
    branchIds: branchIds
  };

  this.reportService.getChart(filter).subscribe({

    next: (data) => {

      this.loading = false;

      // 🔥 الداتا الأصلية
      this.chartData = data ?? [];

      this.noData = this.chartData.length === 0;

      // 🔥 حساب نسبة الإنجاز يدويًا (حل مشكلة الشارت)
      this.chartData = this.chartData.map(x => ({
        ...x,
        achievementPercentage:
          x.dailyTargetAmount > 0
            ? Number(((x.achievedAmount / x.dailyTargetAmount) * 100).toFixed(1))
            : 0
      }));

      this.calculateKpis();
      this.renderChart();

    },

    error: (err) => {
      console.error("API ERROR =>", err);
      this.loading = false;
      this.noData = true;
    }

  });

}



  calculateKpis(): void {

    this.totalBranches = this.chartData.length;

    this.totalTarget = this.chartData.reduce(
      (sum, x) => sum + x.dailyTargetAmount,
      0
    );

    this.totalAchieved = this.chartData.reduce(
      (sum, x) => sum + x.achievedAmount,
      0
    );

    this.averageAchievement =
      this.totalTarget === 0
        ? 0
        : Number(
            (
              (this.totalAchieved / this.totalTarget) *
              100
            ).toFixed(1)
          );

  }

  refresh(): void {

    this.loadChart();

  }

  resetFilters(): void {

    this.filterForm.patchValue({

      cityId: [],

      branchId: null

    });

    this.filteredBranches = [...this.branches];

    this.loadChart();

  }

  formatAmount(value: number): string {

    return new Intl.NumberFormat('en-US').format(value);

  }

  getAchievementColor(): string {

    if (this.averageAchievement >= 100)
      return '#16a34a';

    if (this.averageAchievement >= 80)
      return '#f59e0b';

    if (this.averageAchievement >= 60)
      return '#2563eb';

    return '#dc2626';

  }

  getAchievementStatus(): string {

    if (this.averageAchievement >= 100)
      return 'ممتاز';

    if (this.averageAchievement >= 80)
      return 'جيد جداً';

    if (this.averageAchievement >= 60)
      return 'جيد';

    return 'يحتاج متابعة';

  }

renderChart(): void {
  if (!this.chartCanvas) return;

  const oldCanvas = this.chartCanvas.nativeElement;
  const newCanvas = oldCanvas.cloneNode(true) as HTMLCanvasElement;
  oldCanvas.replaceWith(newCanvas);
  this.chartCanvas = { nativeElement: newCanvas } as ElementRef<HTMLCanvasElement>;

  if (this.chart) {
    this.chart.destroy();
  }

  const labels = this.chartData.map(x => x.branchName);
  const targetData = this.chartData.map(x => x.dailyTargetAmount);
  const achievedData = this.chartData.map(x => x.achievedAmount);
  const percentageData = this.chartData.map(x => x.achievementPercentage);
  const dates = this.chartData.map(x => x.targetDate?.split('T')[0]); // 🔹 التاريخ بدون الوقت

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'التارجت',
          data: targetData,
          backgroundColor: '#4F46E5',
          borderRadius: 8,
          order: 2
        },
        {
          type: 'bar',
          label: 'المتحقق',
          data: achievedData,
          backgroundColor: '#10B981',
          borderRadius: 8,
          order: 2
        },
        {
          type: 'line',
          label: 'نسبة الإنجاز %',
          data: percentageData,
          borderColor: '#F59E0B',
          backgroundColor: '#1d1506',
          borderWidth: 4,
          tension: .35,
          fill: false,
          pointRadius: 8,
          pointHoverRadius: 12,
          yAxisID: 'y1',
          order: 1
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { position: 'top' },

        datalabels: {
          font: { weight: 'bold', size: 16 },
          borderRadius: 6,
          padding: 6,

          formatter: function (value: number, context: any) {
            const date = dates[context.dataIndex];

            // 🔹 كتابة نص داخل الأعمدة
            if (context.dataset.label === 'التارجت') {
              return `الهدف اليومي\n${Number(value).toLocaleString()}`;
            }

            if (context.dataset.label === 'المتحقق') {
              return `المحقق\n${Number(value).toLocaleString()}`;
            }

            // 🔹 كتابة نسبة الإنجاز فوق الخط
            if (context.dataset.type === 'line') {
              return `نسبة الإنجاز: ${value}%\n${date}`; // 🔹 التاريخ فوق النسبة
            }

            return '';
          },

          color: function (context: any) {
            if (context.dataset.type === 'line') return '#000';
            return '#fff';
          },

          backgroundColor: function (context: any) {
            if (context.dataset.type === 'line') return '#fff';
            return 'transparent';
          },

          anchor: function (context: any) {
            if (context.dataset.type === 'line') return 'end'; // 🔹 فوق النقطة
            return 'center';
          },

          align: function (context: any) {
            if (context.dataset.type === 'line') return 'top'; // 🔹 فوق الخط
            return 'center';
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'القيمة' }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'نسبة الإنجاز %' }
        }
      }
    }
  };

  this.chart = new Chart(this.chartCanvas.nativeElement, config);
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
get paginatedData() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.chartData.slice(start, start + this.pageSize);
}

get totalPages() {
  return Math.ceil(this.chartData.length / this.pageSize);
}





}