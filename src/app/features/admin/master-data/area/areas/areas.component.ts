import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './areas.component.html'
})
export class AreasComponent implements OnInit {

  areas: any[] = [];
  filteredAreas: any[] = [];

  cities: any[] = [];

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
    this.loadCities();
    this.loadAreas();
  }

  buildForm() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\u0600-\u06FF ]+$/) // حروف عربية + إنجليزية + مسافات فقط
        ]
      ],
      cityId: [null, Validators.required]
    });
  }

  loadCities() {
    this.masterData.getCities().subscribe({
      next: res => {
        if (res.success) {
          this.cities = res.data.map(c => ({
            id: c.id,
            name: c.cityName
          }));
        }
      },
      error: err => console.error('خطأ في تحميل المدن', err)
    });
  }

  loadAreas() {
    this.masterData.getAreas().subscribe({
      next: res => {
        if (res.success) {
          this.areas = res.data.map(a => ({
            id: a.id,
            name: a.regionName,
            cityId: a.cityId,
            cityName: a.cityName // لو الـ API بيرجعها
          }));

          this.filteredAreas = [...this.areas];
          this.currentPage = 1;
          this.updatePagination();
        }
      },
      error: err => console.error('خطأ في تحميل المناطق', err)
    });
  }

  applySearch() {
    this.filteredAreas = this.masterData.searchLocal(this.areas, this.searchTerm, 'name');
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredAreas.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedAreas() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAreas.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  startAdd() {
    this.showForm = true;
    this.editMode = false;
    this.editingId = null;
    this.form.reset();
  }

  edit(area: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = area.id;

    this.form.patchValue({
      name: area.name,
      cityId: area.cityId
    });
  }

  details(area: any) {
    alert(
      `تفاصيل المنطقة:\n\n` +
      `الكود: ${area.id}\n` +
      `الاسم: ${area.name}\n` +
      `المدينة: ${area.cityName ?? ''}`
    );
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

    const payload = {
      areaName: this.form.value.name,
      cityId: this.form.value.cityId
    };

    if (this.editMode && this.editingId != null) {
      this.masterData.updateArea(this.editingId, payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadAreas();
          }
        },
        error: err => console.error('خطأ في تعديل المنطقة', err)
      });

    } else {
      this.masterData.createArea(payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadAreas();
          }
        },
        error: err => console.error('خطأ في إضافة المنطقة', err)
      });
    }
  }

  remove(area: any) {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;

    this.masterData.deleteArea(area.id).subscribe({
      next: res => {
        if (res.success) {
          this.loadAreas();
        }
      },
      error: err => console.error('خطأ في حذف المنطقة', err)
    });
  }
}
