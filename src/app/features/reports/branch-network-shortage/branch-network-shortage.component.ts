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
  shortageTypes: any[] = [];
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

  // 🔥 Getter لحساب مبلغ العجز حسب النوع
  getShortageAmount(row: any, typeId: number): number {
    const item = row.shortages.find((s: any) => s.shortageTypeId === typeId);
    return item ? item.amount : 0;
  }

  // 🔥 Getter لحساب إجمالي العجز
  getTotalShortage(row: any): number {
    return row.shortages.reduce((sum: number, s: any) => sum + s.amount, 0);
  }

}
