import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchControlIssueService } from '../../../services/branch-control-issue.service';
import { ManagerBranchControlIssue } from '../../../shared/models/manager-branch-control-issue.model';
import { BranchControlIssueStatus, ResolutionType } from '../../../shared/models/enums';
import SignaturePad from 'signature_pad';
@Component({
  selector: 'app-branch-control-manager-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './branch-control-manager-report.component.html',
  styleUrls: ['./branch-control-manager-report.component.css']
})
export class BranchControlManagerReportComponent implements OnInit, AfterViewInit {

  private signaturePad!: SignaturePad;
  issues: ManagerBranchControlIssue[] = [];
  loading = false;
  form!: FormGroup;
  
  pageSize = 15;        // عدد الصفوف في الصفحة
 currentPage = 1;      // الصفحة الحالية

  statuses = BranchControlIssueStatus;
  resolutionTypes = ResolutionType;

  selectedIssue: ManagerBranchControlIssue | null = null;
  managerNotes: string | null = null;
  managerSignature: string | null = null;
  isApproved = false;

  // ⭐ Canvas للتوقيع
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  constructor(private service: BranchControlIssueService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngAfterViewInit(): void {
    // ❌ لا نستخدمه هنا لأن الـ modal لسه مش ظاهر
  }

  // ============================
  // بناء الفورم
  // ============================
  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],
      status: ['all']   // ⭐ الديفولت "الكل"
    });
  }

  // ============================
  // تحميل التقرير
  // ============================
loadReport(): void {
  this.loading = true;

  const filter: any = {
    fromDate: this.form.value.fromDate,
    toDate: this.form.value.toDate
  };

  if (this.form.value.status !== 'all') {
    filter.status = this.form.value.status;
  }

  this.service.getManagerReport(filter).subscribe({
    next: (res) => {
      this.issues = res;
      this.currentPage = 1;   // ⭐ نرجع لأول صفحة بعد كل بحث
      this.loading = false;
    },
    error: () => this.loading = false
  });
}



  // ============================
  // فتح نافذة التفاصيل
  // ============================
openDetails(issue: ManagerBranchControlIssue): void {
  this.selectedIssue = issue;
  this.isApproved = issue.isManagerApproved;
  this.managerNotes = issue.managerNotes ?? null;
  this.managerSignature = issue.managerSignature ?? null;

  setTimeout(() => {
    const canvas = this.signatureCanvas.nativeElement;

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)',
      penColor: 'rgb(0,0,0)',
      minWidth: 1.5,
      maxWidth: 3.5,
      throttle: 0,
      velocityFilterWeight: 0.7
    });

    // ⭐ لو فيه توقيع محفوظ — اعرضه
    if (this.managerSignature) {
      this.signaturePad.fromDataURL(this.managerSignature);
    } else {
      this.signaturePad.clear();
    }
  }, 50);
}


  // ============================
  // إغلاق النافذة
  // ============================
  closeDetails(): void {
    this.selectedIssue = null;
  }

  // ============================
  // تهيئة لوحة التوقيع
  // ============================
  initializeSignaturePad(): void {
    if (!this.signatureCanvas) return;

    const canvas = this.signatureCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  startDrawing(event: MouseEvent): void {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent): void {
    if (!this.drawing) return;

    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000';

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  stopDrawing(): void {
    this.drawing = false;
  }

clearSignature(): void {
  if (this.signaturePad) {
    this.signaturePad.clear();
  }
}


  // ============================
  // حفظ الاعتماد
  // ============================
saveApproval(): void {
  if (!this.selectedIssue) return;

  const signatureBase64 = this.signaturePad.isEmpty()
    ? null
    : this.signaturePad.toDataURL('image/png');

  const dto = {
    id: this.selectedIssue.id,
    isManagerApproved: this.isApproved,
    managerSignature: signatureBase64,
    managerNotes: this.managerNotes
  };

  this.service.managerApprove(dto).subscribe({
    next: () => {
      alert('تم حفظ الاعتماد بنجاح');
      this.closeDetails();
      this.loadReport();
    },
    error: () => alert('حدث خطأ أثناء حفظ الاعتماد')
  });
}
printManagerReport(): void {
  const table = document.querySelector('table');
  if (!table) {
    alert('لا توجد بيانات للطباعة');
    return;
  }

  const popup = window.open('', '_blank', 'width=900,height=700');

  popup!.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>تقرير اعتماد المدير</title>
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
        <h2>تقرير اعتماد المدير</h2>
        ${table.outerHTML}
      </body>
    </html>
  `);

  popup!.document.close();
  popup!.print();
}


  // ============================
  // تحويل قرار الرقابة من رقم إلى اسم
  // ============================
  getResolutionName(type: ResolutionType | null): string {
    switch (type) {
      case ResolutionType.EmployeeFault:
        return 'خطأ موظف';
      case ResolutionType.SystemError:
        return 'خطأ نظام';
      case ResolutionType.InventoryDifference:
        return 'فرق جرد';
      case ResolutionType.Settled:
        return 'تم التسوية';
      case ResolutionType.UnderReview:
        return 'قيد المراجعة';
      default:
        return '-';
    }
  }

  get pagedIssues() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  return this.issues.slice(startIndex, endIndex);
}

get totalPages(): number {
  return Math.ceil(this.issues.length / this.pageSize) || 1;
}
}
