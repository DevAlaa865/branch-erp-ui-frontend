import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchControlIssueService } from '../../../services/branch-control-issue.service';
import { BranchControlIssue } from '../../../shared/models/branch-control-issue.model';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchControlIssueStatus, ResolutionType } from '../../../shared/models/enums';

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
      resolutionType: [null]
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
}
