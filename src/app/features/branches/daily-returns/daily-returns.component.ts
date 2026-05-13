import { Component, OnInit } from '@angular/core';
import { BranchDailyReturn, BranchDailyReturnsService } from '../../../services/branch-daily-returns.service';
import { MasterDataService } from '../../../services/master-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-daily-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './daily-returns.component.html',
  styleUrls: ['./daily-returns.component.css']
})
export class DailyReturnsComponent implements OnInit {

  returns: BranchDailyReturn[] = [];
  loading = false;
  error: string | null = null;

  filterForm!: FormGroup;

  selectedReturn: BranchDailyReturn | null = null;

  cities: any[] = [];
  branches: any[] = [];

  // 🔥 الباجينيشن
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;

  constructor(
    private returnsService: BranchDailyReturnsService,
    private masterService: MasterDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      fromDate: [new Date().toISOString().substring(0, 10)],
      toDate: [new Date().toISOString().substring(0, 10)],
      cityId: [null],
      branchNumber: [null],
      returnType: [0]
    });

    this.loadCities();
    this.loadReturns();

    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
      if (cityId) {
        this.loadBranches(cityId);
      } else {
        this.branches = [];
        this.filterForm.patchValue({ branchNumber: null }, { emitEvent: false });
      }
      this.loadReturns();
    });
  }

  loadCities() {
    this.masterService.getCities().subscribe(res => {
      this.cities = res.data;
    });
  }

  loadBranches(cityId: number) {
    this.masterService.getBranchesByCity(cityId).subscribe((res: any) => {
      this.branches = res.data || res;
    });
  }

  loadReturns(): void {
    this.loading = true;
    this.error = null;

    const { fromDate, toDate, branchNumber, cityId, returnType } = this.filterForm.value;

    this.returnsService
      .getReturns(fromDate, toDate, undefined, branchNumber, cityId, returnType)
      .subscribe({
        next: (data) => {
          this.returns = data.map(item => ({
            ...item,
            returnDate: item.returnDate.substring(0, 10)
          }));

          // 🔥 حساب عدد الصفحات
          this.totalPages = Math.ceil(this.returns.length / this.pageSize);
          this.currentPage = 1;

          this.loading = false;
        },
        error: () => {
          this.error = 'حدث خطأ أثناء تحميل البيانات';
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadReturns();
  }

  // ============================
  // 🔥 الباجينيشن
  // ============================
get pagedReturns(): BranchDailyReturn[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.returns.slice(start, start + this.pageSize);
}

nextPage(): void {
  if (this.currentPage < this.totalPages) this.currentPage++;
}

previousPage(): void {
  if (this.currentPage > 1) this.currentPage--;
}

  // ============================
  // التعديل
  // ============================
  openEditDialog(item: BranchDailyReturn): void {
    this.selectedReturn = { ...item };
    const d = new Date(this.selectedReturn.returnDate);
    this.selectedReturn.returnDate = d.toISOString().substring(0, 10);
  }

  closeDialog(): void {
    this.selectedReturn = null;
  }

  saveChanges(): void {
    if (!this.selectedReturn) return;

    const payload = {
      branchNumber: this.selectedReturn.branchNumber,
      returnDate: this.selectedReturn.returnDate,
      returnAmount: this.selectedReturn.returnAmount,
      returnType: this.selectedReturn.returnType,
      notes: this.selectedReturn.notes
    };

    this.returnsService.update(this.selectedReturn.id, payload).subscribe({
      next: () => {
        this.loadReturns();
        this.closeDialog();

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم تعديل المرتجع بنجاح',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'حدث خطأ أثناء حفظ التعديلات',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  exportToExcel(): void {
  const filter = this.filterForm.value;
  this.loading = true;

  this.returnsService.exportToExcel(filter).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      const fileName = `DailyReturns_${filter.fromDate}_to_${filter.toDate}.xlsx`;

      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      alert("حدث خطأ أثناء تصدير ملف المرتجعات");
    }
  });
}

}
