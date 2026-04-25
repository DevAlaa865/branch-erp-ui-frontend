import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import { jsPDF } from 'jspdf';
import { MasterDataService } from '../../../services/master-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HasPermissionDirective } from "../../../core/directives/has-permission.directive";

import { NgSelectModule } from '@ng-select/ng-select';
interface ShortageDetail {
  id: number;
  shortageTypeId: number;
  shortageTypeName: string;
  amount: number;
  attachmentPath: string | null;
  employeeId: number | null;
  employeeName: string | null;
  isReturnApproved?: boolean | null;
  isDiscountApproved?: boolean | null;
  returnNotes?: string | null;
  discountNotes?: string | null;
}

interface BranchDailySalesReport {
  salesDate: string;
  branchName: string;
  supervisorName: string;

  cashAmount: number;
  networkAmount: number;
  creditAmount: number;
  totalSales: number;
  grandTotal: number;
  totalInvoicesCount: number;
  totalQuantities: number;
  difference: number;
  differenceLabel: string;

  shortageDetails: ShortageDetail[];
  attachmentPath: string | null;
  supervisorNotes: string | null;
}

@Component({
  selector: 'app-daily-sales-inquiry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HasPermissionDirective,  NgSelectModule],
  templateUrl: './daily-sales-inquiry.component.html',
  styleUrls: ['./daily-sales-inquiry.component.css']
})
export class DailySalesInquiryComponent implements OnInit {

  userInfo: any;
  isBranchUser = false;
  branches: any[] = [];

  daily: any;
  showEmployeeColumn = false;
  form!: FormGroup;

  branchName = '';
  branchId: number | null = null;

  isLoading = false;
  errorMessage = '';
  report: BranchDailySalesReport | null = null;

  // المستخدم الوحيد اللي يقدر يعدّل
  canApproveShortages = false;

  // القيمة المختارة من الدروب داون
selectedBranch: any = null;

// إعدادات الدروب داون


  fileBaseUrl = 'https://localhost:7025/';
  apiBaseUrl = 'https://localhost:7025';

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private branchSalesDailyService: BranchSalesDailyService,
    private master: MasterDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${this.apiBaseUrl}/${path}`;
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      salesDate: [null, Validators.required],
      branchId: [null]
    });

    this.userInfo = this.auth.getUserInfo();

    // ✔ فقط اللي معاه صلاحية تعديل المرتجعات/الخصومات
   /*  this.canApproveShortages = this.auth.hasPermission('Returns.View') ; */

const editPermissions = [
  'Returns.View',

  'Discounts.View'
];

this.canApproveShortages = editPermissions.some(p => this.auth.hasPermission(p));
    // لو المستخدم فرع
    if (this.userInfo && this.userInfo.branchId) {
      this.isBranchUser = true;
      this.branchId = this.userInfo.branchId;
      this.branchName = decodeURIComponent(escape(String(this.userInfo.branchName || '')));
      this.form.patchValue({ branchId: this.branchId });
    } else {
      // مستخدم مركزي
      this.isBranchUser = false;
      this.loadBranches();
    }

    // قراءة البرامترات القادمة من السمرى أو إدارة المرتجعات
    this.route.queryParams.subscribe((params: any) => {

      const branchIdFromQuery = params['branchId'];
      const dateFromQueryRaw = params['salesDate'];
      const dateFromQuery = this.normalizeDate(dateFromQueryRaw);

      // ✔ لو جاي من إدارة المرتجعات أو السمرى
      if (branchIdFromQuery && dateFromQuery) {

        if (!this.isBranchUser) {
          this.form.patchValue({
            branchId: Number(branchIdFromQuery)
          });
        }

        this.form.patchValue({
          salesDate: dateFromQuery
        });

        // ✔ نعمل استعلام فقط لو فيه branchId
        setTimeout(() => {
          if (this.form.value.branchId) {
            this.search();
          }
        }, 200);

        return;
      }

      // ✔ لو جاي من كارت الاستعلام → لا تعمل search تلقائي
      const today = new Date().toISOString().split('T')[0];
      this.form.patchValue({ salesDate: today });
    });
  }

  // ===============================
  //   دالة تحويل التاريخ Normalize
  // ===============================
  normalizeDate(date: any): string | null {
    if (!date) return null;

    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }

    if (typeof date === 'string' && date.includes('/')) {
      const parts = date.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }

    return date;
  }

  loadBranches() {
    this.master.getBranches().subscribe({
      next: res => {
        this.branches = res.data || [];
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'حدث خطأ أثناء تحميل قائمة الفروع.';
      }
    });
  }

  search(): void {
    this.errorMessage = '';
    this.report = null;

    if (this.form.invalid) {
      this.errorMessage = 'من فضلك اختر التاريخ أولاً.';
      return;
    }

    const date: string = this.form.value.salesDate;

    let branchIdToUse: number | null = null;

    if (this.isBranchUser) {
      branchIdToUse = this.branchId;
    } else {
      branchIdToUse = this.form.value.branchId;
    }

    if (!branchIdToUse) {
      this.errorMessage = 'من فضلك اختر الفرع أولاً.';
      return;
    }

    this.isLoading = true;

    this.branchSalesDailyService
      .getByBranchAndDate(branchIdToUse, date)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (!res || !res.data || res.data.length === 0) {
            this.errorMessage = 'لا توجد يومية لهذا التاريخ.';
            return;
          }

          const item = res.data[0];

          this.report = {
            salesDate: item.salesDate.split('T')[0],
            branchName: item.branchName,
            supervisorName: item.supervisorName,

            cashAmount: item.cashAmount,
            networkAmount: item.networkAmount,
            creditAmount: item.creditAmount,
            totalSales: item.totalSales,
            grandTotal: item.grandTotal,
            totalInvoicesCount: item.totalInvoicesCount,
            totalQuantities: item.totalQuantities,
            attachmentPath: item.attachmentPath,
            difference: item.difference,
            differenceLabel: item.difference === 0 ? 'متوازن' : (item.difference > 0 ? 'زيادة' : 'عجز'),

            shortageDetails: item.shortageDetails || [],
            supervisorNotes: item.supervisorNotes || null
          };

          this.showEmployeeColumn = this.report.shortageDetails.some(x => x.employeeName);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'حدث خطأ أثناء جلب التقرير';
          console.error(err);
        }
      });
  }

  openImageAsPdf(path: string | null | undefined) {
    if (!path) return;

    const imageUrl = this.fileBaseUrl + path;

    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();

        reader.onload = () => {
          const imgData = reader.result as string;

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
          pdf.output('dataurlnewwindow');
        };

        reader.readAsDataURL(blob);
      });
  }

  goBackToDashboard() {
    if(this.isBranchUser)
    {
       this.router.navigate(['/dashboard']);
    }
    else{
this.router.navigate(['/reports/branch-daily-summary']);
    }
    
  }

  updateApprovals() {
    if (!this.report || !this.report.shortageDetails) return;

    const updates = this.report.shortageDetails
      .filter(s =>
        s['isReturnApproved'] === true ||
        s['isDiscountApproved'] === true
      )
      .map(s => ({
        id: s.id,
        isReturnApproved: s['isReturnApproved'] ?? null,
        isDiscountApproved: s['isDiscountApproved'] ?? null,
        returnNotes: s.returnNotes ?? null,
        discountNotes: s.discountNotes ?? null
      }));

    if (updates.length === 0) {
      alert("من فضلك اختر عنصر واحد على الأقل للتعديل");
      return;
    }

    this.branchSalesDailyService.updateShortagesApprovals(updates)
      .subscribe({
        next: () => {
          alert("تم تعديل اليومية بنجاح");
          this.router.navigate(['/reports/returns-discounts-management']);
        },
        error: () => {
          alert("حدث خطأ أثناء التعديل");
        }
      });
  }



}
