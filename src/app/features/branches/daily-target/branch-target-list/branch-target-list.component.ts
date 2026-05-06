import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CustomSelectComponent } from "../../../../shared/custom-select/custom-select.component";
import { Component, OnInit } from "@angular/core";
import { MasterDataService } from "../../../../services/master-data.service";
import { BranchDailyTargetService } from "../../../../services/branch-daily-target.service";
import { Router } from "@angular/router";
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-branch-target-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './branch-target-list.component.html',
  styleUrls: ['./branch-target-list.component.scss']
})
export class BranchTargetListComponent implements OnInit {

  filterForm!: FormGroup;

  cities: any[] = [];
  cityOptions: any[] = [];

  branches: any[] = [];
  branchOptions: any[] = [];

  targets: any[] = [];          // كل النتائج
  targetsToShow: any[] = [];    // نتائج الصفحة الحالية فقط

  page = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private master: MasterDataService,
    private targetService: BranchDailyTargetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();

    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.loadBranches(cityId);
    });
  }

  buildForm() {
    this.filterForm = this.fb.group({
      cityId: [null],
      branchId: [null],
      date: [new Date().toISOString().substring(0, 10)]
    });
  }

  loadCities(): void {
    this.master.getCities().subscribe({
      next: (res: any) => {
        this.cities = res.data || [];
        this.cityOptions = this.cities.map((c: any) => ({
          id: c.id,
          name: c.cityName
        }));
      }
    });
  }

  loadBranches(cityId: number | null): void {
    this.branches = [];
    this.filterForm.patchValue({ branchId: null });

    if (!cityId) return;

    this.master.getBranchesByCity(cityId).subscribe({
      next: (res: any) => {
        this.branches = res.data || [];

        this.branchOptions = this.branches.map((b: any) => ({
          id: b.id,
          name: b.branchName
        }));
      }
    });
  }

  // 🔥 حساب نسبة الإنجاز
  private mapWithPercentage(data: any[]): any[] {
    return data.map((t: any) => ({
      ...t,
      achievementPercentage:
        t.totalBranchTarget > 0
          ? Math.round((t.totalAchieved / t.totalBranchTarget) * 100)
          : 0
    }));
  }

  // 🔥 دالة الباجينيشن
  paginate(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.totalPages = Math.ceil(this.targets.length / this.pageSize);

    this.targetsToShow = this.targets.slice(start, end);
  }

  loadTargets(): void {
    const filters = this.filterForm.value;

    const cityId = filters.cityId;
    const branchId = filters.branchId;
    const date = filters.date;

    if (!date) {
      alert('من فضلك اختر التاريخ');
      return;
    }

    this.targets = [];
    this.page = 1; // إعادة ضبط الصفحة

    // 🔥 1) لو اختار فرع
    if (branchId) {
      this.targetService.getByBranchAndDate(branchId, date).subscribe({
        next: (res: any) => {
          this.targets = this.mapWithPercentage(res.data || []);
          this.paginate();
        }
      });
      return;
    }

    // 🔥 2) لو اختار مدينة فقط
    if (cityId) {
      let pending = this.branches.length;

      this.branches.forEach((b: any) => {
        this.targetService.getByBranchAndDate(b.id, date).subscribe({
          next: (res: any) => {
            if (res.data && res.data.length > 0) {
              const mapped = this.mapWithPercentage(res.data);
              this.targets.push(...mapped);
            }

            pending--;
            if (pending === 0) this.paginate();
          }
        });
      });

      return;
    }

    // 🔥 3) لو اختار تاريخ فقط
    this.master.getBranches().subscribe({
      next: (res: any) => {
        const allBranches = res.data || [];
        let pending = allBranches.length;

        allBranches.forEach((b: any) => {
          this.targetService.getByBranchAndDate(b.id, date).subscribe({
            next: (res2: any) => {
              if (res2.data && res2.data.length > 0) {
                const mapped = this.mapWithPercentage(res2.data);
                this.targets.push(...mapped);
              }

              pending--;
              if (pending === 0) this.paginate();
            }
          });
        });
      }
    });
  }

  // 🔵 زر الشارت العام
  openChartForAll(): void {
    this.router.navigate(['/branches/target-chart'], {
      queryParams: {
        data: JSON.stringify(this.targets)
      }
    });
  }

  // 🟢 زر تحميل Excel
  exportToExcel(): void {
    if (this.targets.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const exportData = this.targets.map(t => ({
      الفرع: t.branchName,
      التاريخ: t.targetDate.substring(0, 10),
      التارجت: t.totalBranchTarget,
      المنجز: t.totalAchieved,
      نسبة_الإنجاز: t.achievementPercentage + "%"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Targets");

    XLSX.writeFile(workbook, "BranchTargets.xlsx");
  }


edit(e: any): void {
  this.router.navigate(['/branches/daily-target'], {
    queryParams: { id: e.headerId }
  });
}
  viewDetails(id: number): void {
    this.router.navigate(['/branches/daily-target'], {
      queryParams: { id, view: true }
    });
  }

  delete(id: number): void {
    if (!confirm('هل تريد حذف التارجت؟')) return;

    this.targetService.delete(id).subscribe({
      next: () => {
        alert('تم حذف التارجت بنجاح');
        this.loadTargets();
      },
      error: () => {
        alert('حدث خطأ أثناء الحذف');
      }
    });
  }
}
