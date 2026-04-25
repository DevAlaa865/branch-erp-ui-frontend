import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';


@Component({
  selector: 'app-activity-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './activity-types.component.html'
})
export class ActivityTypesComponent implements OnInit {

  activityTypes: any[] = [];
  filteredActivityTypes: any[] = [];

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
    this.loadActivityTypes();
  }

  // ✅ Validation على اسم نوعية النشاط (حروف عربية + إنجليزية + مسافات فقط)
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

  loadActivityTypes() {
    this.masterData.getActivityTypes().subscribe({
      next: res => {
        // لو الـ API بيرجع { success, data } زي الباقي
        if (res.success) {
          this.activityTypes = res.data.map((x: any) => ({
            id: x.id,
            name: x.activityName
          }));
        } else {
          // لو بيرجع Array مباشرة
          if (Array.isArray(res)) {
            this.activityTypes = res.map((x: any) => ({
              id: x.id,
              name: x.activityName
            }));
          }
        }

        this.filteredActivityTypes = [...this.activityTypes];
        this.currentPage = 1;
        this.updatePagination();
      },
      error: err => console.error('خطأ في تحميل نوعية النشاط', err)
    });
  }

  applySearch() {
    this.filteredActivityTypes = this.masterData.searchActivityTypesLocal(
      this.activityTypes,
      this.searchTerm
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredActivityTypes.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedActivityTypes() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredActivityTypes.slice(start, start + this.pageSize);
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
    alert(`تفاصيل نوعية النشاط:\n\nالكود: ${item.id}\nالاسم: ${item.name}`);
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
      this.masterData.updateActivityType(this.editingId, payload).subscribe({
        next: res => {
          if (res.success || res === true) {
            this.cancel();
            this.loadActivityTypes();
          }
        },
        error: err => console.error('خطأ في تعديل نوعية النشاط', err)
      });

    } else {
      this.masterData.createActivityType(payload).subscribe({
        next: res => {
          if (res.success || res === true) {
            this.cancel();
            this.loadActivityTypes();
          }
        },
        error: err => console.error('خطأ في إضافة نوعية النشاط', err)
      });
    }
  }

  remove(item: any) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    this.masterData.deleteActivityType(item.id).subscribe({
      next: res => {
        if (res.success || res === true) {
          this.loadActivityTypes();
        }
      },
      error: err => console.error('خطأ في حذف نوعية النشاط', err)
    });
  }
}
