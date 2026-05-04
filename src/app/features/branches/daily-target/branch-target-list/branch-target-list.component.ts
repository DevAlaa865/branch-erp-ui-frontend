import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CustomSelectComponent } from "../../../../shared/custom-select/custom-select.component";
import { Component, OnInit } from "@angular/core";
import { MasterDataService } from "../../../../services/master-data.service";
import { BranchDailyTargetService } from "../../../../services/branch-daily-target.service";
import { Router } from "@angular/router";

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
  // 🔥 هنا الربط الصحيح
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

loadTargets(): void {
  const filters = this.filterForm.value;

  if (!filters.branchId || !filters.date) {
    alert('من فضلك اختر الفرع والتاريخ');
    return;
  }

  this.targetService.getByBranchAndDate(filters.branchId, filters.date)
    .subscribe({
      next: (res: any) => {
        this.targets = res.data || [];
      }
    });
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
