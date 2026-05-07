import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchDailyPerformanceService } from '../../../services/branch-daily-performance.service';
import { BranchDailyPerformanceDto } from '../../../shared/models/employee-target.models';

@Component({
  selector: 'app-daily-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-performance.component.html',
  styleUrls: ['./daily-performance.component.css']
})
export class DailyPerformanceComponent implements OnInit {

  branchId!: number;
  branchName!: string;
  supervisorName!: string;

  targetDate: string = '';
  data: BranchDailyPerformanceDto | null = null;
  isLoading = false;

  constructor(
    private performanceService: BranchDailyPerformanceService
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.branchId = user.branchId;
      this.branchName = user.branchName;
      this.supervisorName = user.fullName;
    }

    const today = new Date();
    this.targetDate = today.toISOString().substring(0, 10);
    this.load();
  }

load() {
  if (!this.targetDate || !this.branchId) return;

  this.isLoading = true;

  this.performanceService.get(this.branchId, this.targetDate)
    .subscribe({
      next: (res: any) => {
        this.data = res.data;   // ← أهم تعديل
        this.isLoading = false;
      },
      error: () => {
        this.data = null;
        this.isLoading = false;
      }
    });
}


saveAchievement() {
  if (!this.data) return;

  const model = {
    branchId: this.branchId,
    targetDate: this.targetDate,
    branchAchievedAmount: this.data.branchAchievedAmount,
    branchInvoicesCountAchieved: this.data.branchInvoicesCountAchieved,
    branchItemsCountAchieved: this.data.branchItemsCountAchieved
  };

  this.performanceService.saveAchievement(model).subscribe({
    next: (res: any) => {
      alert('تم حفظ إنجاز الفرع بنجاح');
      this.load();
    }
  });
}

}
