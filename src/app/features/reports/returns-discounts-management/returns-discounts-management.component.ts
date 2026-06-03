import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-returns-discounts-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './returns-discounts-management.component.html'
})
export class ReturnsDiscountsManagementComponent implements OnInit {

  form!: FormGroup;

  cities: any[] = [];
  branches: any[] = [];

  rows: any[] = [];
  pagedRows: any[] = [];

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  errorMessage = '';
  isLoading = false;

  shortageTypes: any[] = [];
  allowedShortageTypeIds: number[] = [];   // ⭐ الأنواع المسموح بها فقط

  constructor(
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private branchSalesDailyService: BranchSalesDailyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
    this.loadShortageTypes();
  }

  buildForm(): void {
    this.form = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      cityId: [null],
      branchId: [null],
      status: [0],             // ⭐ 0 = All
      shortageTypeId: [null]   // ⭐ نوع العجز
    });

    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({
      fromDate: today,
      toDate: today
    });

    this.form.get('cityId')?.valueChanges.subscribe(cityId => {
      this.loadBranches(cityId);
    });
  }

  loadCities(): void {
    this.masterDataService.getCities().subscribe({
      next: (res: any) => {
        this.cities = res.data || [];
      }
    });
  }

  loadShortageTypes(): void {
    this.masterDataService.getShortageTypes().subscribe({
      next: (res: any) => {
        const allTypes = res.data || [];

        // ⭐ استبعاد الأنواع غير المرغوبة
        this.shortageTypes = allTypes.filter((t: any) =>
          !['عجز غير معروف', 'عجز مسموح به', 'فاتورة معلنه', 'صيانه', 'تغطيه']
            .includes(t.shortageName)
        );

        // ⭐ خزّن IDs المسموح بها فقط
        this.allowedShortageTypeIds = this.shortageTypes.map(t => t.id);
      },
      error: () => {
        this.shortageTypes = [];
      }
    });
  }

  loadBranches(cityId: number | null): void {
    this.branches = [];
    this.form.patchValue({ branchId: null });

    if (!cityId) return;

    this.masterDataService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => {
        this.branches = res.data || [];
      }
    });
  }

  search(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'من فضلك أكمل بيانات الفترة أولاً.';
      return;
    }

    const filter = {
      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate,
      cityId: this.form.value.cityId || null,
      branchId: this.form.value.branchId || null,
      status: this.form.value.status,
      shortageTypeId: this.form.value.shortageTypeId
    };


    this.isLoading = true;

    this.branchSalesDailyService.getReturnsDiscountsManagement(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (!res || res.success === false) {
          this.errorMessage = res?.message || 'لا توجد بيانات.';
          this.rows = [];
          return;
        }

       let rows = res.data || [];

      // ⭐ فلترة النتيجة بناءً على الأنواع المسموح بها فقط
      rows = rows.filter((r: any) =>
        this.allowedShortageTypeIds.includes(r.shortageTypeId)
      );

      this.rows = rows;
      this.currentPage = 1;
      this.calculatePagination();

      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء تحميل البيانات.';
      }
    });
  }

  calculatePagination(): void {
    if (!this.rows.length) {
      this.pagedRows = [];
      this.totalPages = 1;
      return;
    }

    this.totalPages = Math.ceil(this.rows.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedRows = this.rows.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculatePagination();
    }
  }

openDailyDetails(row: any) {

  const url = this.router.serializeUrl(
    this.router.createUrlTree(
      ['/revenue-management/daily-sales-inquiry'],
      {
        queryParams: {
          branchId: row.branchId,
          salesDate: row.journalDate
        }
      }
    )
  );

  window.open(url, '_blank');
}

printReport(): void {
  // نجهز نسخة كاملة من كل الصفوف بدون الباجينيشن
  const fullTable = document.createElement('table');
  fullTable.className = 'w-full text-right text-sm';
  fullTable.innerHTML = `
    <thead class="bg-slate-200 text-slate-900">
      <tr>
        <th class="p-3 border-b border-slate-300 text-center">الفرع</th>
        <th class="p-3 border-b border-slate-300 text-center">التاريخ</th>
        <th class="p-3 border-b border-slate-300 text-center">نوع العجز</th>
        <th class="p-3 border-b border-slate-300 text-center">المبلغ</th>
      </tr>
    </thead>
    <tbody>
      ${this.rows.map(r => `
        <tr class="border-b">
          <td class="p-3 text-center text-black">${r.branchName}</td>
          <td class="p-3 text-center text-black">${r.journalDate}</td>
          <td class="p-3 text-center text-black">${r.shortageTypeName}</td>
          <td class="p-3 text-center text-black">${r.amount}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  const popup = window.open('', '_blank', 'width=1000,height=800');
  if (!popup) return;

  popup.document.open();
  popup.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>طباعة التقرير</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #f1f5f9; }
          h2 { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>تقرير إدارة المرتجعات والخصومات</h2>
        ${fullTable.outerHTML}
      </body>
    </html>
  `);

  popup.document.close();
  popup.print();
}


}
