import { Component, OnInit } from '@angular/core';
import { BranchDailyReturn, BranchDailyReturnsService } from '../../../services/branch-daily-returns.service';
import { MasterDataService } from '../../../services/master-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-daily-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomSelectComponent],
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

  totalAmount: number = 0;
  totalCount: number = 0;

  pageSize = 10;
  currentPage = 1;
  totalPages = 0;

  constructor(
    private returnsService: BranchDailyReturnsService,
    private masterService: MasterDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();
  }

  // ============================
  // FORM
  // ============================
  buildForm(): void {
    this.filterForm = this.fb.group({
      fromDate: [new Date().toISOString().substring(0, 10)],
      toDate: [new Date().toISOString().substring(0, 10)],

      cityIds: [[]],
      branchIds: [[]],
      returnType: [0]
    });

    // فقط تحديث الفروع (بدون تحميل تقرير)
    this.filterForm.get('cityIds')?.valueChanges.subscribe(cityIds => {

      this.branches = [];
      this.filterForm.patchValue({ branchIds: [] }, { emitEvent: false });

      if (cityIds?.length) {
        this.loadBranches(cityIds);
      }
    });
  }

  // ============================
  // CITIES
  // ============================
  loadCities() {
    this.masterService.getCities().subscribe(res => {
      this.cities = res.data || [];
    });
  }

  // ============================
  // BRANCHES
  // ============================
  loadBranches(cityIds: number[]) {
    this.masterService.getBranchesByCities(cityIds).subscribe((res: any) => {
      this.branches = res.data || [];
    });
  }

// ============================
// 🔥 MAIN REPORT BUTTON
// ============================
loadReturns(): void {

  this.loading = true;
  this.error = null;

  let {
    fromDate,
    toDate,
    branchIds,
    cityIds,
    returnType
  } = this.filterForm.value;

  // لو مختارش فروع نعتبر كل الفروع الظاهرة مختارة
  if ((!branchIds || branchIds.length === 0) && this.branches.length > 0) {
    branchIds = this.branches.map(x => x.id);
  }
console.log('cityIds', cityIds);
console.log('branchIds', branchIds);
console.log('returnType', returnType);
  this.returnsService.getReturns(
    fromDate,
    toDate,
    undefined,
    undefined,
    cityIds,
    branchIds,
    returnType
  )
  .subscribe({
    next: (data) => {
    console.log('API RESULT', data);
      this.returns = (data || []).map(item => ({
        ...item,
        returnDate: item.returnDate?.substring(0, 10)
      }));
console.log('returns=', this.returns);
console.log('totalCount=', this.returns.length);
console.log('pagedReturns=', this.pagedReturns);
      this.totalAmount =
        this.returns.reduce((sum, r) => sum + r.returnAmount, 0);

      this.totalCount = this.returns.length;

      this.totalPages =
        Math.ceil(this.returns.length / this.pageSize);

      this.currentPage = 1;

      this.loading = false;
    },
    error: (err) => {
          console.log('API ERROR', err);
      this.error = 'حدث خطأ أثناء تحميل البيانات';
      this.loading = false;
    }
  });
}

selectAllCities(): void {

  const all = this.cities.map(c => c.id);

  this.filterForm.patchValue({
    cityIds: all
  });

  this.loadBranches(all);

  setTimeout(() => {

    const allBranches =
      this.branches.map(b => b.id);

    this.filterForm.patchValue({
      branchIds: allBranches
    });

  }, 300);
}

  // ============================
  // SELECT ALL BRANCHES
  // ============================
  selectAllBranches(): void {
    const allIds = this.branches.map(b => b.id);

    this.filterForm.patchValue({
      branchIds: allIds
    });
  }

  clearAllBranches(): void {
    this.filterForm.patchValue({
      branchIds: []
    });
  }

  // ============================
  // PAGINATION
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
  // EDIT
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
          timer: 3000
        });
      },
      error: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'حدث خطأ أثناء الحفظ',
          timer: 3000
        });
      }
    });
  }

  // ============================
  // EXPORT
  // ============================
  exportToExcel(): void {
    const filter = this.filterForm.value;
    this.loading = true;

    this.returnsService.exportToExcel(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `DailyReturns_${filter.fromDate}_to_${filter.toDate}.xlsx`;
        a.click();

        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('حدث خطأ أثناء التصدير');
      }
    });
  }

  // ============================
  // CHART
  // ============================
  openChart(): void {
    const filter = this.filterForm.value;

    this.returnsService.getChartData(filter).subscribe({
      next: (res) => {
        const data = encodeURIComponent(JSON.stringify(res.data));
        window.open(`/branches/daily-returns-chart?data=${data}`, "_blank");
      },
      error: () => {
        alert("حدث خطأ أثناء تحميل الشارت");
      }
    });
  }
}