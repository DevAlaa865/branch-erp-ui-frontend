import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-city-branch-sales-summary-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-branch-sales-summary-chart.component.html'
})
export class CityBranchSalesSummaryChartComponent implements OnInit {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  filter: any = {};
  rows: any[] = [];
  chart: any;

  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportService: BranchSalesDailyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];

      if (!fromDate || !toDate) {
        this.router.navigate(['/reports/city-branch-sales-summary']);
        return;
      }

      let cityIds: number[] | null = null;
      if (params['cityIds']) {
        const raw = Array.isArray(params['cityIds']) ? params['cityIds'] : [params['cityIds']];
        cityIds = raw.map((x: any) => Number(x)).filter(x => !isNaN(x));
      }

      const activityTypeId = params['activityTypeId'] ? Number(params['activityTypeId']) : null;
      const branchType = params['branchType'] || 'All';

      this.filter = {
        fromDate,
        toDate,
        cityIds: cityIds && cityIds.length ? cityIds : null,
        activityTypeId,
        branchType
      };

      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportService.getCityBranchSalesSummary(this.filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || res.success === false) {
          this.errorMessage = res?.message || 'لا توجد بيانات.';
          this.rows = [];
          return;
        }

        this.rows = res.data || [];
        setTimeout(() => this.buildChart(), 100);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء تحميل بيانات الشارت.';
      }
    });
  }

  buildChart(): void {
    if (this.chart) this.chart.destroy();

    const labels = this.rows.map(r => r.branchName);
    const totalSales = this.rows.map(r => r.totalSales);
    const invoices = this.rows.map(r => r.invoicesCount);
    const quantities = this.rows.map(r => r.quantitiesCount);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'إجمالي البيع',
            data: totalSales,
            backgroundColor: 'rgba(37, 99, 235, 0.7)'
          },
          {
            label: 'عدد الفواتير',
            data: invoices,
            backgroundColor: 'rgba(16, 185, 129, 0.7)'
          },
          {
            label: 'عدد القطع',
            data: quantities,
            backgroundColor: 'rgba(234, 179, 8, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'مقارنة الفروع (إجمالي البيع / الفواتير / القطع)'
          }
        }
      }
    });
  }
  goBack(): void {
  this.router.navigate(
    ['/reports/city-branch-sales-summary'],
    { queryParams: this.filter }
  );
}
}
