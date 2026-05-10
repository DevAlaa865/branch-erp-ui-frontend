import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchDailyPerformanceService } from '../../../services/branch-daily-performance.service';
import { BranchDailyPerformanceDto } from '../../../shared/models/employee-target.models';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MasterDataService } from '../../../services/master-data.service';

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
  data: any = {};
  isLoading = false;

  constructor(
    private performanceService: BranchDailyPerformanceService,
    private auth :AuthService,
    private router:Router,
        private master: MasterDataService,
  ) {}

ngOnInit(): void {
const user = this.auth.getUserInfo();

this.branchId = user.branchId!;
this.branchName = decodeURIComponent(escape(user.branchName!));
this.master.getBranchById(this.branchId).subscribe(res => {
  const branch = res?.data;
  if (branch) {
    this.supervisorName = branch.supervisorName || '';
  }
});


  const today = new Date();
  this.targetDate = today.toLocaleDateString('en-CA');

  this.load();
}

load() {
  this.isLoading = true;

  this.performanceService.get(this.branchId, this.targetDate).subscribe({
    next: (res: any) => {

      // لو الـ API رجّع null → نحط object فاضي
      this.data = res?.data || {
        branchTargetAmount: 0,
        branchAchievedAmount: 0,
        branchInvoicesCountAchieved: 0,
        branchItemsCountAchieved: 0
      };

      this.isLoading = false;
    },
    error: () => {
      this.data = {
        branchTargetAmount: 0,
        branchAchievedAmount: 0,
        branchInvoicesCountAchieved: 0,
        branchItemsCountAchieved: 0
      };
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

      // تحميل البيانات لو حبيت تراجعها قبل التحويل
      this.load();

      // 🔹 التحويل التلقائي إلى شاشة الداشبورد
      this.router.navigate(['/branches/performance-dashboard'], {
        queryParams: {
          branchId: this.branchId,
          branchName: this.branchName,
          supervisorName: this.supervisorName,
          date: this.targetDate
        }
      });
    },
    error: () => {
      alert('حدث خطأ أثناء حفظ الإنجاز، حاول مرة أخرى.');
    }
  });
}

goBack()
{
        this.router.navigate(['/branches/performance-dashboard'], {
        queryParams: {
          branchId: this.branchId,
          branchName: this.branchName,
          supervisorName: this.supervisorName,
          date: this.targetDate
        }
      });
}
}
