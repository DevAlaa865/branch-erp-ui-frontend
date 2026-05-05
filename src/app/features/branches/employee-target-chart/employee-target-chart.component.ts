import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-employee-target-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-target-chart.component.html',
  styleUrls: ['./employee-target-chart.component.scss']
})
export class EmployeeTargetChartComponent implements OnInit {

  employees: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const raw = params['data'];
      if (raw) {
        try {
          this.employees = JSON.parse(raw);
          this.buildCharts();
        } catch {
          this.employees = [];
        }
      }
    });
  }

  buildCharts(): void {
    if (!this.employees || this.employees.length === 0) return;

    const labels = this.employees.map(e => e.employeeName);
    const targets = this.employees.map(e => e.employeeTarget || 0);
    const achieved = this.employees.map(e => e.employeeAchieved || 0);

    const canvasBar: any = document.getElementById('employeeBarChart');
    const ctxBar = canvasBar.getContext('2d');

    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'التارجت',
            data: targets,
            backgroundColor: 'rgba(59, 130, 246, 0.6)'
          },
          {
            label: 'المنجز',
            data: achieved,
            backgroundColor: 'rgba(16, 185, 129, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });

    const totalTarget = targets.reduce((a, b) => a + b, 0);
    const totalAchieved = achieved.reduce((a, b) => a + b, 0);

    const canvasPie: any = document.getElementById('employeePieChart');
    const ctxPie = canvasPie.getContext('2d');

    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['إجمالي التارجت', 'إجمالي المنجز'],
        datasets: [
          {
            data: [totalTarget, totalAchieved],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
