import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../../services/master-data.service';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './countries.component.html'
})
export class CountriesComponent implements OnInit {

  countries: any[] = [];
  filteredCountries: any[] = [];

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
  }

  // ✅ هنا عملنا Validation على اسم البلد
  buildForm() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\u0600-\u06FF ]+$/) // حروف عربية + إنجليزية + مسافات فقط
        ]
      ]
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

          this.filteredCountries = [...this.countries];
          this.currentPage = 1;
          this.updatePagination();
        }
      },
      error: err => console.error('خطأ في تحميل البلاد', err)
    });
  }

  applySearch() {
    this.filteredCountries = this.masterData.searchCountriesLocal(this.countries, this.searchTerm);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredCountries.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedCountries() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCountries.slice(start, start + this.pageSize);
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

  edit(country: any) {
    this.showForm = true;
    this.editMode = true;
    this.editingId = country.id;

    this.form.patchValue({
      name: country.name
    });
  }

  details(country: any) {
    alert(`تفاصيل البلد:\n\nالكود: ${country.id}\nالاسم: ${country.name}`);
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

    const payload = { countryName: this.form.value.name };

    if (this.editMode && this.editingId != null) {
      this.masterData.updateCountry(this.editingId, payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadCountries();
          }
        },
        error: err => console.error('خطأ في تعديل البلد', err)
      });

    } else {
      this.masterData.createCountry(payload).subscribe({
        next: res => {
          if (res.success) {
            this.cancel();
            this.loadCountries();
          }
        },
        error: err => console.error('خطأ في إضافة البلد', err)
      });
    }
  }

  remove(country: any) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    this.masterData.deleteCountry(country.id).subscribe({
      next: res => {
        if (res.success) {
          this.loadCountries();
        }
      },
      error: err => console.error('خطأ في حذف البلد', err)
    });
  }
}
