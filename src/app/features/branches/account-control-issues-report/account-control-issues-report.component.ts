import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchControlIssueService } from '../../../services/branch-control-issue.service';
import { AccountantBranchControlIssue } from '../../../shared/models/accountant-branch-control-issue.model';
import { AccountantBranchControlIssueDetails } from '../../../shared/models/accountant-branch-control-issue-details.model';

@Component({
  selector: 'app-account-control-issues-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './account-control-issues-report.component.html',
  styleUrls: ['./account-control-issues-report.component.css']
})
export class AccountControlIssuesReportComponent  implements OnInit {

  form!: FormGroup;
  issues: AccountantBranchControlIssue[] = [];
  selectedIssue: AccountantBranchControlIssueDetails | null = null;

  loading = false;

  pageSize = 15;
  currentPage = 1;

  constructor(private fb: FormBuilder, private service: BranchControlIssueService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],
      isManagerApproved: ['all']
    });
  }

  loadReport(): void {
    this.loading = true;

    const filter: any = {
      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate
    };

    if (this.form.value.isManagerApproved !== 'all') {
      filter.isManagerApproved = this.form.value.isManagerApproved === 'true';
    }

    this.service.getAccountantReport(filter).subscribe({
      next: (res) => {
        this.issues = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openDetails(id: number): void {
    this.service.getAccountantDetails(id).subscribe({
      next: (res) => this.selectedIssue = res
    });
  }

  closeDetails(): void {
    this.selectedIssue = null;
  }

  get pagedIssues() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.issues.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.issues.length / this.pageSize) || 1;
  }
  getResolutionName(type: number): string {
  switch (type) {
    case 1: return 'خطأ موظف';
    case 2: return 'خطأ نظام';
    case 3: return 'فرق جرد';
    case 4: return 'تم التسوية';
    case 5: return 'قيد المراجعة';
    default: return '-';
  }
}

printReport() {
  const section = document.getElementById('report-section');

  if (!section) {
    alert('لم يتم العثور على جزء التقرير للطباعة');
    return;
  }

  const printContents = section.innerHTML;
  const popupWin = window.open('', '_blank', 'width=1200,height=800');

  popupWin!.document.open();
  popupWin!.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>تقرير المحاسب</title>
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          th {
            background: #f0f0f0;
            font-weight: bold;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          /* ⭐ نفس اللي في شاشة المدير */
          th.no-print, td.no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <h2>تقرير المحاسب - فروق الفروع</h2>
        ${printContents}
      </body>
    </html>
  `);

  popupWin!.document.close();
  popupWin!.print();
}


}
