import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BranchDailyDetailReportResponse } from '../../../../shared/models/branch-daily-details-report.model';
import { BranchDailyDetailsReportService } from '../../../../services/reports/branch-daily-details-report.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-daily-details',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './branch-daily-details.component.html',
  styleUrls: ['./branch-daily-details.component.scss']
})
export class BranchDailyDetailsComponent implements OnInit {
branchName!: string;
  branchId!: number;
  fromDate!: string;
  toDate!: string;

  loading = true;
  data!: BranchDailyDetailReportResponse;

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyDetailsReportService,
    private router :Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.branchId = Number(params['branchId']);
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.branchName = params['branchName'];
      this.loadData();
    });
  }

  loadData() {
    this.loading = true;

    this.reportService
      .getBranchDailyDetails(this.branchId, this.fromDate, this.toDate)
      .subscribe({
        next: (res: BranchDailyDetailReportResponse) => {
          this.data = res;

          // 🔥 تجهيز الباجينيشن بعد تحميل البيانات
          this.totalItems = this.data.items.length;
          this.updatePagedItems();

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  openDailyJournal(date: string) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(
        ['/revenue-management/daily-sales-inquiry'],
        {
          queryParams: {
            branchId: this.branchId,
            salesDate: date
           
          }
        }
      )
    );

    window.open(url, '_blank');
  }

  // ============================================================
  // 🔥🔥🔥  البـــاجــيــنــيــشــن (Pagination)  🔥🔥🔥
  // ============================================================

  currentPage = 1;          // الصفحة الحالية
  pageSize = 10;            // عدد الصفوف في الصفحة
  totalItems = 0;           // إجمالي عدد الصفوف
  pagedItems: any[] = [];   // البيانات المعروضة في الصفحة الحالية

  // تحديث البيانات المعروضة حسب الصفحة
  updatePagedItems() {
    if (!this.data || !this.data.items) return;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.pagedItems = this.data.items.slice(startIndex, endIndex);
  }

  // الذهاب للصفحة التالية
  nextPage() {
    if (this.currentPage * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.updatePagedItems();
    }
  }

  // الذهاب للصفحة السابقة
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedItems();
    }
  }

  // تغيير عدد الصفوف في الصفحة
  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagedItems();
  }
get totalPages(): number {
  return Math.ceil(this.totalItems / this.pageSize);
}
printReport()
{

}
exportToExcel()
{

}
}
