import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchNetworkShortageReportService } from '../../../services/branch-network-shortage-report.service';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-branch-network-shortage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-network-shortage.component.html',
  styleUrls: ['./branch-network-shortage.component.css']
})
export class BranchNetworkShortageComponent implements OnInit {

  fromDate = '';
  toDate = '';
  cityId: number | null = null;

  data: any[] = [];
  isLoading = false;

  // 🔥 هنا هنخزن المدن
  cities: any[] = [];

  constructor(
    private reportService: BranchNetworkShortageReportService,
    private masterData: MasterDataService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.fromDate = today;
    this.toDate = today;

    this.loadCities();
  }

  // 🔥 تحميل المدن من MasterDataService
  loadCities() {
    this.masterData.getCities().subscribe({
      next: (res) => {
        // حسب الـ API عندك: غالبًا res.data
        this.cities = res.data || [];
      },
      error: () => {
        this.cities = [];
      }
    });
  }

  load() {
    this.isLoading = true;

    const filter = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      cityId: this.cityId
    };

    this.reportService.getReport(filter).subscribe({
      next: (res) => {
        this.data = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.data = [];
        this.isLoading = false;
      }
    });
  }
}
