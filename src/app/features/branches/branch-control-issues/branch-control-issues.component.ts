import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchControlIssueService } from '../../../services/branch-control-issue.service';
import { BranchControlIssue } from '../../../shared/models/branch-control-issue.model';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchControlIssueStatus, ResolutionType, DifferenceDirection } from '../../../shared/models/enums';

@Component({
  selector: 'app-branch-control-issues',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './branch-control-issues.component.html',
  styleUrls: ['./branch-control-issues.component.css']
})
export class BranchControlIssuesComponent implements OnInit {

  issues: BranchControlIssue[] = [];
  loading = false;
  form!: FormGroup;

  // ⭐ بيانات التعديل
  selectedIssue: BranchControlIssue | null = null;
  editStatus: BranchControlIssueStatus | null = null;
  editResolutionType: ResolutionType | null = null;
  editNotes: string | null = null;

  // ⭐ Enums للـ HTML
  statuses = BranchControlIssueStatus;
  resolutionTypes = ResolutionType;
  differenceDirections = DifferenceDirection;

  // ⭐ الباجينيشن
  pageSize = 15;
  currentPage = 1;

  get pagedIssues() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.issues.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.issues.length / this.pageSize) || 1;
  }

  constructor(private service: BranchControlIssueService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  // ============================
  // بناء الفورم
  // ============================
  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],
      branchId: [null],
      status: [null],
      resolutionType: [null],
      differenceDirection: [null]
    });
  }

  // ============================
  // تحميل الحالات
  // ============================
  loadIssues(): void {
    this.loading = true;
    const filter = this.form.value;

    this.service.getAll(filter).subscribe({
      next: (res) => {
        this.issues = res;
        this.currentPage = 1; // ⭐ نرجع لأول صفحة بعد كل بحث
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ============================
  // فتح نافذة التعديل
  // ============================
  openEdit(issue: BranchControlIssue): void {
    this.selectedIssue = issue;
    this.editStatus = issue.status;
    this.editResolutionType = issue.resolutionType ?? null;
    this.editNotes = issue.controlNotes ?? null;
  }

  // ============================
  // إغلاق النافذة
  // ============================
  closeEdit(): void {
    this.selectedIssue = null;
  }

  // ============================
  // حفظ التعديلات
  // ============================
  saveChanges(): void {
    if (!this.selectedIssue) return;

    const dto = {
      id: this.selectedIssue.id,
      status: this.editStatus,
      resolutionType: this.editResolutionType,
      controlNotes: this.editNotes
    };

    this.service.updateIssue(dto).subscribe({
      next: () => {
        alert('تم تحديث الحالة بنجاح');
        this.closeEdit();
        this.loadIssues();
      },
      error: () => {
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    });
  }
printReport(): void {
  const table = document.querySelector('table');
  if (!table) {
    alert('لا توجد بيانات للطباعة');
    return;
  }

  const popup = window.open('', '_blank', 'width=900,height=700');

  popup!.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>تقرير الرقابة على الفروع</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; margin: 20px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #f1f1f1; }

          /* ⭐ إخفاء عمود الإجراءات وقت الطباعة */
          th.no-print, td.no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <h2>تقرير الرقابة على الفروع</h2>
        ${table.outerHTML}
      </body>
    </html>
  `);

  popup!.document.close();
  popup!.print();
}


}
