import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

@Component({
  selector: "app-daily-returns-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./daily-returns-chart.component.html",
  styleUrls: ["./daily-returns-chart.component.scss"]
})
export class DailyReturnsChartComponent implements OnInit {

  branches: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const raw = params['data'];
      if (raw) {
        try {
          this.branches = JSON.parse(raw);
          this.buildChart();
        } catch {
          this.branches = [];
        }
      }
    });
  }

  buildChart(): void {
    if (!this.branches || this.branches.length === 0) return;

    const labels = this.branches.map(b => b.branchName);

    const cash = this.branches.map(b => b.cash || 0);
    const replacement = this.branches.map(b => b.replacement || 0);
    const tabby = this.branches.map(b => b.tabby || 0);
    const tamara = this.branches.map(b => b.tamara || 0);

    const canvasBar: any = document.getElementById("returnsBarChart");
    const ctxBar = canvasBar.getContext("2d");

    new Chart(ctxBar, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "كاش",
            data: cash,
            backgroundColor: "rgba(16, 185, 129, 0.7)"
          },
          {
            label: "استبدال",
            data: replacement,
            backgroundColor: "rgba(59, 130, 246, 0.7)"
          },
          {
            label: "تابى",
            data: tabby,
            backgroundColor: "rgba(234, 179, 8, 0.7)"
          },
          {
            label: "تمارا",
            data: tamara,
            backgroundColor: "rgba(239, 68, 68, 0.7)"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          x: { stacked: false },
          y: { beginAtZero: true }
        }
      }
    });
  }
}
