import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';


@Component({
  selector: 'app-shortage-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './shortage-types.component.html'
})
export class ShortageTypesComponent implements OnInit {

  shortageTypes: any[] = [];
  filteredShortageTypes: any[] = [];

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
    this.loadShortageTypes();
  }

  buildForm() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\u0600-\u06FF ]+$/)
        ]
      ]
    });
  }

  loadShortageTypes() {
    this.masterData.getShortageTypes().subscribe({
      next: res => {
        // نفس شكل الريسبونس اللي شوفناه في Swagger:
        // { success: true, data: [], ... }
        if (res && res.success) {
          this.shortageTypes = res.data.map((x: any) => ({
            id: x.id,
            name: x.shortageName
          }));
        } else if (Array.isArray(res)) {
          this.shortageTypes = res.map((x: any) => ({
            id: x.id,
            name: x.shortageName
          }));
        } else {
          this.shortageTypes = [];
        }

        this.filteredShortageTypes = [...this.shortageTypes];
        this.currentPage = 1;
        this.updatePagination();
      },
      error: err => {
        console.error('خطأ في تحميل أنواع العجز', err);
      }
    });
  }

  applySearch() {
    this.filteredShortageTypes = this.masterData.searchShortageTypesLocal(
      this.shortageTypes,
      this.searchTerm
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredShortageTypes.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedShortageTypes() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredShortageTypes.slice(start, start + this.pageSize);
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
    this.form.reset();
  }

  edit(item: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = item.id;

    this.form.patchValue({
      name: item.name
    });
  }

  details(item: any) {
    alert(`تفاصيل نوع العجز:\n\nالكود: ${item.id}\nالاسم: ${item.name}`);
  }

  cancel() {
    this.showForm = false;
    this.editMode = false;
    this.editingId = null;
    this.form.reset();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { name: this.form.value.name };

    if (this.editMode && this.editingId != null) {
      this.masterData.updateShortageType(this.editingId, payload).subscribe({
        next: res => {
          if (res.success || res === true) {
            this.cancel();
            this.loadShortageTypes();
          }
        },
        error: err => {
          console.error('خطأ في تعديل نوع العجز', err);
        }
      });

    } else {
      this.masterData.createShortageType(payload).subscribe({
        next: res => {
          if (res.success || res === true) {
            this.cancel();
            this.loadShortageTypes();
          }
        },
        error: err => {
          console.error('خطأ في إضافة نوع العجز', err);
        }
      });
    }
  }

  remove(item: any) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    this.masterData.deleteShortageType(item.id).subscribe({
      next: res => {
        if (res.success || res === true) {
          this.loadShortageTypes();
        }
      },
      error: err => {
        console.error('خطأ في حذف نوع العجز', err);
      }
    });
  }
}
