import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css',
})
export class BranchComponent implements OnInit {

  branches: any[] = [];
  filteredBranches: any[] = [];

  cities: any[] = [];
  activityTypes: any[] = [];
  supervisors: any[] = [];

  searchTerm = '';

  form!: FormGroup;

  showForm = false;
  editMode = false;
  editingId: number | null = null;

    selectedBranch: any = null;
  showDetailsPopup: boolean = false;
  // pagination
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private masterData: MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
    this.loadDropdowns();
  }

  buildForm() {
    this.form = this.fb.group({
      branchName: ['', Validators.required],
      branchNumber: [0, [Validators.required, Validators.min(1)]],
      branchType: [1, Validators.required],
      cityId: [0, [Validators.required, Validators.min(1)]],
      activityTypeId: [0, [Validators.required, Validators.min(1)]],
      supervisorId: [null]
    });
  }

  get f() {
    return this.form.controls;
  }

  loadDropdowns() {
    this.masterData.getCities().subscribe((res: any) => {
      if (res.success) this.cities = res.data;
    });

    this.masterData.getActivityTypes().subscribe((res: any) => {
      if (res.success) this.activityTypes = res.data;
    });

    this.masterData.getEmployees().subscribe((res: any) => {
      if (res.success) {
        this.supervisors = res.data.filter((x: any) => x.isSupervisor);
      }
    });
  }

  loadBranches() {
    this.masterData.getBranches().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.branches = res.data;
          this.filteredBranches = [...this.branches];
          this.currentPage = 1;
          this.updatePagination();
        }
      }
    });
  }

  applySearch() {
    this.filteredBranches = this.masterData.searchBranchesLocal(
      this.branches,
      this.searchTerm
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredBranches.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedBranches() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBranches.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  startAdd() {
    this.showForm = true;
    this.editMode = false;
    this.editingId = null;
    this.form.reset({ branchType: 1, cityId: 0, activityTypeId: 0, supervisorId: null });
  }

  edit(item: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = item.id;

    this.form.patchValue({
      branchName: item.branchName,
      branchNumber: item.branchNumber,
      branchType: item.branchType,
      cityId: item.cityId,
      activityTypeId: item.activityTypeId,
      supervisorId: item.supervisorId
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    if (this.editMode) {
      this.masterData.updateBranch(this.editingId!, payload).subscribe(() => {
        this.cancel();
        this.loadBranches();
      });
    } else {
      this.masterData.createBranch(payload).subscribe(() => {
        this.cancel();
        this.loadBranches();
      });
    }
  }

  cancel() {
    this.showForm = false;
    this.editMode = false;
    this.editingId = null;
    this.form.reset();
  }

  remove(item: any) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    this.masterData.deleteBranch(item.id).subscribe(() => {
      this.loadBranches();
    });
  }

  showDetails(item: any) {
    this.selectedBranch = item;
    this.showDetailsPopup = true;
  }

  closeDetails() {
    this.showDetailsPopup = false;
    this.selectedBranch = null;
  }
}
