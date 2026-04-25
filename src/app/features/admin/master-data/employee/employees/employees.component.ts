import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {

  employees: any[] = [];
  filteredEmployees: any[] = [];
  showDetailsPopup = false;
  selectedEmployee: any = null;
  searchTerm = '';

  form!: FormGroup;

  showForm = false;
  editMode = false;
  editingId: number | null = null;

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
    this.loadEmployees();
  }

  buildForm() {
    this.form = this.fb.group({
      employeeCode: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\u0600-\u06FF ]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      gender: ['Male', Validators.required],
      position: ['', Validators.required],
      isSupervisor: [false],
      isActive: [true]
    });
  }

  loadEmployees() {
    this.masterData.getEmployees().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.employees = res.data.map((e: any) => ({
            id: e.id,
            employeeCode: e.employeeCode,
            fullName: e.fullName,
            phone: e.phone,
            gender: e.gender,
            position: e.position,
            isSupervisor: e.isSupervisor,
            isActive: e.isActive
          }));
        }

        this.filteredEmployees = [...this.employees];
        this.currentPage = 1;
        this.updatePagination();
      }
    });
  }

  applySearch() {
    this.filteredEmployees = this.masterData.searchEmployeesLocal(
      this.employees,
      this.searchTerm
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  startAdd() {
    this.showForm = true;
    this.editMode = false;
    this.editingId = null;
    this.form.reset({
      gender: 'Male',
      isSupervisor: false,
      isActive: true
    });
  }
    showDetails(item: any) {
      this.selectedEmployee = item;
      this.showDetailsPopup = true;
    }

    closeDetails() {
    this.showDetailsPopup = false;
    this.selectedEmployee = null;
     }
  edit(item: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = item.id;

    this.form.patchValue({
      employeeCode: item.employeeCode,
      fullName: item.fullName,
      phone: item.phone,
      gender: item.gender,
      position: item.position,
      isSupervisor: item.isSupervisor,
      isActive: item.isActive
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    if (this.editMode && this.editingId != null) {
      this.masterData.updateEmployee(this.editingId, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.cancel();
            this.loadEmployees();
          }
        }
      });

    } else {
      this.masterData.createEmployee(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.cancel();
            this.loadEmployees();
          }
        }
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

    this.masterData.deleteEmployee(item.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadEmployees();
        }
      }
    });
  }
}
