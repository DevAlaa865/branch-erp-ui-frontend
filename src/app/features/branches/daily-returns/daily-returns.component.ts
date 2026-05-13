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

    // 🔥 عند تغيير المدينة → تحميل الفروع
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

  // ============================
  // 🔥 تحميل المدن
  // ============================
  loadCities() {
    this.masterService.getCities().subscribe(res => {
      this.cities = res.data;
    });
  }

  // ============================
  // 🔥 تحميل الفروع حسب المدينة
  // ============================
  loadBranches(cityId: number) {
    this.masterService.getBranchesByCity(cityId).subscribe((res: any) => {
      this.branches = res.data || res;
    });
  }

  // ============================
  // 🔥 تحميل المرتجعات مع الفلاتر
  // ============================
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
  // 🔥 فتح نافذة التعديل
  // ============================
  openEditDialog(item: BranchDailyReturn): void {
    this.selectedReturn = { ...item };
    const d = new Date(this.selectedReturn.returnDate);
    this.selectedReturn.returnDate = d.toISOString().substring(0, 10);
  }

  closeDialog(): void {
    this.selectedReturn = null;
  }

  // ============================
  // 🔥 حفظ التعديلات
  // ============================
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
}
