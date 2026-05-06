import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MasterDataService } from "../../../services/master-data.service";
import { EmployeeDailyTargetReportService } from "../../../services/employee-daily-target-report.service";
import * as XLSX from 'xlsx';
import { CustomSelectComponent } from "../../../shared/custom-select/custom-select.component";

@Component({
  selector: 'app-employee-target-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './employee-target-list.component.html',
  styleUrls: ['./employee-target-list.component.scss']
})
export class EmployeeTargetListComponent implements OnInit {

  filterForm!: FormGroup;

  cities: any[] = [];
  cityOptions: any[] = [];

  branches: any[] = [];
  branchOptions: any[] = [];

  employees: any[] = [];

  page = 1;
  pageSize = 10;
  totalCount = 0;
  employeesToShow: any[] = [];

  loading = false;

  constructor(
    private fb: FormBuilder,
    private master: MasterDataService,
    private employeeReportService: EmployeeDailyTargetReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCities();

    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.loadBranches(cityId);
    });
  }

  buildForm(): void {
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
    this.branchOptions = [];
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

  loadEmployees(): void {
    const filters = this.filterForm.value;

    const cityId = filters.cityId;
    const branchId = filters.branchId;
    const date = filters.date;

    if (!date) {
      alert('من فضلك اختر التاريخ');
      return;
    }

    this.loading = true;
    this.employees = [];
    this.employeesToShow = [];
    this.page = 1;

    this.employeeReportService.getEmployeeReport(cityId, branchId, date).subscribe({
      next: (res: any) => {
        const data = res.data || res || [];

        this.employees = data.map((e: any) => ({
          ...e,
          achievementPercentage: e.achievementPercentage ?? 0
        
        }));
 /*  console.log("EMPLOYEE ROWS:", this.employees); */
        this.totalCount = this.employees.length;
        this.paginate();
        this.loading = false;
     
      },
      error: () => {
        this.loading = false;
        alert('حدث خطأ أثناء تحميل بيانات الموظفين');
      }
    });
  }

  paginate(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.employeesToShow = this.employees.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  exportToExcel(): void {
    if (this.employees.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const exportData = this.employees.map(e => ({
      المدينة: e.cityName,
      الفرع: e.branchName,
      الموظف: e.employeeName,
      التاريخ: (e.targetDate || '').toString().substring(0, 10),
      التارجت: e.employeeTarget,
      المنجز: e.employeeAchieved,
      نسبة_الإنجاز: e.achievementPercentage + "%"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeTargets");

    XLSX.writeFile(workbook, "EmployeeTargets.xlsx");
  }

  openChartForAll(): void {
    this.router.navigate(['/employees/target-chart'], {
      queryParams: {
        data: JSON.stringify(this.employees)
      }
    });
  }

/*     editEmployee(e: any): void {
    // هنا استخدم نفس روت التعديل اللي بتستخدمه في تقرير الفروع
    // مثال (عدّله حسب مشروعك):
    this.router.navigate(['/branches/daily-target/edit', e.headerId]);
  } */
    editEmployee(e: any): void {
      this.router.navigate(['/branches/daily-target'], {
        queryParams: { id: e.headerId }
      });
    }
  viewDetails(id: number): void {
    this.router.navigate(['/branches/daily-target'], {
      queryParams: { id, view: true }
    });
  }

  deleteEmployee(e: any): void {
    if (!confirm(`هل تريد حذف تارجت الموظف ${e.employeeName}؟`)) {
      return;
    }

    // هنا عندك خيارين:
    // 1) تعمل API مخصوص لحذف detail
    // 2) أو تفتح شاشة التعديل وتعدل من هناك
    // مؤقتًا هنخليها Alert لحد ما نضيف API للحذف
    alert('هنا هنربط API لحذف تفاصيل الموظف من التارجت');
  }

}
