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

  constructor(
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private branchSalesDailyService: BranchSalesDailyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  buildForm(): void {
    this.form = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      cityId: [null],
      branchId: [null]
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
      branchId: this.form.value.branchId || null
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

        this.rows = res.data || [];
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
    this.router.navigate(
      ['/reports/daily-sales-inquiry'],
      {
        queryParams: {
          branchId: row.branchId,
          salesDate: row.journalDate
        }
      }
    );
  }
}
