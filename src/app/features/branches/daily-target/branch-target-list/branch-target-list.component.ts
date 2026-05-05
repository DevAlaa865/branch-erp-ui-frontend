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

  targets: any[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;

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

  // 🔥 دالة لحساب نسبة الإنجاز
  private mapWithPercentage(data: any[]): any[] {
    return data.map((t: any) => ({
      ...t,
      achievementPercentage:
        t.totalBranchTarget > 0
          ? Math.round((t.totalAchieved / t.totalBranchTarget) * 100)
          : 0
    }));
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

    // 🔥 1) لو اختار فرع → نجيب تارجت الفرع فقط
    if (branchId) {
      this.targetService.getByBranchAndDate(branchId, date).subscribe({
        next: (res: any) => {
          this.targets = this.mapWithPercentage(res.data || []);
        }
      });
      return;
    }

    // 🔥 2) لو اختار مدينة فقط → نجيب كل فروع المدينة
    if (cityId) {
      this.branches.forEach((b: any) => {
        this.targetService.getByBranchAndDate(b.id, date).subscribe({
          next: (res: any) => {
            if (res.data && res.data.length > 0) {
              const mapped = this.mapWithPercentage(res.data);
              this.targets.push(...mapped);
            }
          }
        });
      });
      return;
    }

    // 🔥 3) لو اختار تاريخ فقط → نجيب كل الفروع في كل المدن
    this.master.getBranches().subscribe({
      next: (res: any) => {
        const allBranches = res.data || [];

        allBranches.forEach((b: any) => {
          this.targetService.getByBranchAndDate(b.id, date).subscribe({
            next: (res2: any) => {
              if (res2.data && res2.data.length > 0) {
                const mapped = this.mapWithPercentage(res2.data);
                this.targets.push(...mapped);
              }
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

  edit(id: number): void {
    this.router.navigate(['/branches/daily-target'], {
      queryParams: { id }
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
