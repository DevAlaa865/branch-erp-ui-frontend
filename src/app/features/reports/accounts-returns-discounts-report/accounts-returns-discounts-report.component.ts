import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { AccountsReturnsDiscountsReportService } from '../../../services/reports/accounts-returns-discounts-report.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-accounts-returns-discounts-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,CustomSelectComponent],
  templateUrl: './accounts-returns-discounts-report.component.html'
})
export class AccountsReturnsDiscountsReportComponent implements OnInit {

  form!: FormGroup;

  cities: any[] = [];
  branches: any[] = [];
  shortageTypes: any[] = [];

  rows: any[] = [];
  pagedRows: any[] = [];

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private reportService: AccountsReturnsDiscountsReportService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
    this.loadShortageTypes();
  }

  buildForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],
      cityId: [null],
      branchIds: [[]],
      status: [0], // 0 = الكل
      shortageTypeId: [null]
    });

    this.form.get('cityId')?.valueChanges.subscribe(cityId => {
      this.loadBranches(cityId);
    });
  }

  loadCities(): void {
    this.masterDataService.getCities().subscribe({
      next: (res: any) => this.cities = res.data || [],
      error: () => this.cities = []
    });
  }

  loadBranches(cityId: number | null): void {
    this.branches = [];
    if (!cityId) return;

    this.masterDataService.getBranchesByCity(cityId).subscribe({
      next: (res: any) => this.branches = res.data || [],
      error: () => this.branches = []
    });
  }

  selectAllBranches(): void {
    const allIds = this.branches.map(b => b.id);
    this.form.patchValue({ branchIds: allIds });
  }

  loadShortageTypes(): void {
    this.masterDataService.getShortageTypes().subscribe({
      next: (res: any) => {
        const allTypes = res.data || [];
        this.shortageTypes = allTypes.filter((t: any) =>
          !['عجز غير معروف', 'عجز مسموح به', 'فاتورة معلنه', 'صيانه', 'تغطيه']
            .includes(t.shortageName)
        );
      },
      error: () => this.shortageTypes = []
    });
  }

  search(): void {
    if (this.form.invalid) {
      this.errorMessage = 'من فضلك أكمل بيانات الفترة أولاً.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const filter = {
      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate,
      cityId: this.form.value.cityId || null,
      branchIds: this.form.value.branchIds || [],
      status: this.form.value.status,
      shortageTypeId: this.form.value.shortageTypeId || null
    };

    this.reportService.getReport(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.rows = res.data || res || [];
        this.currentPage = 1;
        this.calculatePagination();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء تحميل التقرير.';
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

  printReport(): void {
    const fullTable = document.createElement('table');
    fullTable.className = 'w-full text-right text-sm';
    fullTable.innerHTML = `
      <thead class="bg-slate-200 text-slate-900">
        <tr>
          <th class="p-3 border-b text-center">رقم الفرع</th>
          <th class="p-3 border-b text-center">اسم الفرع</th>
          <th class="p-3 border-b text-center">التاريخ</th>
          <th class="p-3 border-b text-center">نوع العجز</th>
          <th class="p-3 border-b text-center">المبلغ</th>
          <th class="p-3 border-b text-center">معتمد؟</th>
          <th class="p-3 border-b text-center">المصدر</th>
        </tr>
      </thead>
      <tbody>
        ${this.rows.map(r => `
          <tr>
            <td class="p-3 text-center">${r.branchNumber}</td>
            <td class="p-3 text-center">${r.branchName}</td>
            <td class="p-3 text-center">${r.journalDate}</td>
            <td class="p-3 text-center">${r.shortageTypeName}</td>
            <td class="p-3 text-center">${r.amount}</td>
            <td class="p-3 text-center">${r.isApproved ? '✅ معتمد' : '❌ غير معتمد'}</td>
            <td class="p-3 text-center">${r.source}</td>
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
          <title>تقرير حسابات المرتجعات والخصومات</title>
          <style>
            body { font-family: 'Tahoma', sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f1f5f9; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>تقرير حسابات المرتجعات والخصومات</h2>
          ${fullTable.outerHTML}
        </body>
      </html>
    `);

    popup.document.close();
    popup.print();
  }
}
