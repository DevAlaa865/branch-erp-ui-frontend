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
  shortageTypes: any[] = [];   // ← أنواع العجز (أعمدة الجدول)
  isLoading = false;

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

  loadCities() {
    this.masterData.getCities().subscribe({
      next: (res) => {
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

        // استخراج أنواع العجز من أول صف
        if (this.data.length > 0) {
          this.shortageTypes = this.data[0].shortages.map((s: any) => ({
            shortageTypeId: s.shortageTypeId,
            shortageTypeName: s.shortageTypeName
          }));
        }

        this.isLoading = false;
      },
      error: () => {
        this.data = [];
        this.shortageTypes = [];
        this.isLoading = false;
      }
    });
  }
}
