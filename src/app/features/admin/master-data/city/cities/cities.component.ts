import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../../services/master-data.service';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cities.component.html'
})
export class CitiesComponent implements OnInit {

  cities: any[] = [];
  filteredCities: any[] = [];

  countries: any[] = [];

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
    this.loadCountries();
    this.loadCities();
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
      countryId: [null, Validators.required]
    });
  }

  loadCountries() {
    this.masterData.getCountries().subscribe({
      next: res => {
        if (res.success) {
          this.countries = res.data.map(c => ({
            id: c.id,
            name: c.countryName
          }));
        }
      },
      error: err => console.error('خطأ في تحميل البلاد', err)
    });
  }

  loadCities() {
    this.masterData.getCities().subscribe({
      next: res => {
        if (res.success) {
          this.cities = res.data.map(c => ({
            id: c.id,
            name: c.cityName,
            countryId: c.countryId,
            countryName: c.countryName // لو الـ API بيرجعها
          }));

          this.filteredCities = [...this.cities];
          this.currentPage = 1;
          this.updatePagination();
        }
      },
      error: err => console.error('خطأ في تحميل المدن', err)
    });
  }

  applySearch() {
    this.filteredCities = this.masterData.searchLocal(this.cities, this.searchTerm, 'name');
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredCities.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedCities() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCities.slice(start, start + this.pageSize);
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

  edit(city: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = city.id;

    this.form.patchValue({
      name: city.name,
      countryId: city.countryId
    });
  }

  details(city: any) {
    alert(
      `تفاصيل المدينة:\n\n` +
      `الكود: ${city.id}\n` +
      `الاسم: ${city.name}\n` +
      `الدولة: ${city.countryName ?? ''}`
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
      cityName: this.form.value.name,
      countryId: this.form.value.countryId
    };

    if (this.editMode && this.editingId != null) {
      this.masterData.updateCity(this.editingId, payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadCities();
          }
        },
        error: err => console.error('خطأ في تعديل المدينة', err)
      });

    } else {
      this.masterData.createCity(payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadCities();
          }
        },
        error: err => console.error('خطأ في إضافة المدينة', err)
      });
    }
  }

  remove(city: any) {
    if (!confirm('هل أنت متأكد من حذف هذه المدينة؟')) return;

    this.masterData.deleteCity(city.id).subscribe({
      next: res => {
        if (res.success) {
          this.loadCities();
        }
      },
      error: err => console.error('خطأ في حذف المدينة', err)
    });
  }
}
