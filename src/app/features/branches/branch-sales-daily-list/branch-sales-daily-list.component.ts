// branch-sales-daily-list.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import { MasterDataService } from '../../../services/master-data.service';
import { ShortageAttachmentService } from '../../../services/shortage-attachment.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';
import Swal from 'sweetalert2';
import { DailyHeaderAttachmentService } from '../../../services/daily-header-attachment.service';
import { IMAGE_BASE_URL } from '../../../api.config';
import { BranchSalesDailyListRow } from '../../../shared/models/branch-sales-daily-list-row.model';
import { BranchSalesDailyDetails } from '../../../shared/models/branch-sales-daily-details.model';


@Component({
  selector: 'app-branch-sales-daily-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomSelectComponent],
  templateUrl: './branch-sales-daily-list.component.html',
  styleUrls: ['./branch-sales-daily-list.component.scss']
})
export class BranchSalesDailyListComponent implements OnInit {

  filterForm!: FormGroup;
  results: any[] = [];
  branches: any[] = [];
deleteId: number | null = null;
showDeleteDialog = false;
rows: BranchSalesDailyListRow[] = [];
  // 🔥 الباجينيشن
  pageSize = 10;
  currentPage = 1;
  totalPages = 0;

  // 🔥 نافذة التعديل
  editForm!: FormGroup;
selectedDaily: BranchSalesDailyListRow | null = null;
selectedDailyDetails: BranchSalesDailyDetails | null = null;


  // 🔥 بيانات العجز داخل نافذة التعديل
  shortageTypes: any[] = [];
  employeeOptions: { id: number; name: string }[] = [];
  employees: any[] = [];
  imageBaseUrl = IMAGE_BASE_URL;
  constructor(
    private fb: FormBuilder,
    private dailyService: BranchSalesDailyService,
    private masterData: MasterDataService,
    private shortageAttachmentService: ShortageAttachmentService,
    private headerAttachmentService: DailyHeaderAttachmentService,
     private branchSalesDailyService: BranchSalesDailyService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      fromDate: [new Date().toISOString().substring(0, 10)],
      toDate: [new Date().toISOString().substring(0, 10)],
      branchId: [null],
      branchNumber: [null]
    });

    this.loadBranches();
    this.loadLookups();
  }

  // ============================
  // فلاتر
  // ============================
  loadBranches(): void {
    this.masterData.getBranches().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.branches = data.map((b: any) => ({
          id: b.id,
          label: `${b.branchNumber} - ${b.branchName}`
        }));
      }
    });
  }

  loadLookups(): void {
    this.masterData.getEmployees().subscribe(res => {
      this.employees = res.data;
      this.employeeOptions = this.employees.map((emp: any) => ({
        id: emp.id,
        name: emp.fullName
      }));
    });

    this.masterData.getShortageTypes().subscribe({
      next: res => {
        this.shortageTypes = (res.data || []).map((t: any) => ({
          id: t.id,
          name: t.shortageName || t.name
        }));
      }
    });
  }

  search(): void {
    const filter = { ...this.filterForm.value };
    filter.fromDate = filter.fromDate ? filter.fromDate : null;
    filter.toDate = filter.toDate ? filter.toDate : null;

    this.dailyService.search(filter).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.results = data.map((item: any) => ({
          ...item,
          salesDate: item.salesDate ? item.salesDate.substring(0, 10) : null
        }));

        this.totalPages = Math.ceil(this.results.length / this.pageSize);
        this.currentPage = 1;
      },
      error: () => {
        alert('حدث خطأ أثناء تحميل البيانات');
      }
    });
  }
getImageUrl(path: string | null | undefined): string {
  if (!path) return '';

  path = path.replace(/\\/g, "/");

  if (path.startsWith("/")) {
    path = path.substring(1);
  }

  const base = this.imageBaseUrl.replace(/\/+$/, "");

  return `${base}/${path}`;
}

  // ============================
  // 🔥 الباجينيشن
  // ============================
  get pagedResults(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.results.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ============================
  // 🔥 التعديل (فتح نافذة)
  // ============================
  edit(row: any) {
    this.dailyService.getById(row.id).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.selectedDaily = data;
        this.buildEditForm(data);
      },
      error: () => {
        alert('حدث خطأ أثناء تحميل بيانات اليومية');
      }
    });
  }

  buildEditForm(data: any): void {
    this.editForm = this.fb.group({
      id: [data.id],
      branchId: [data.branchId],
      supervisorId: [data.supervisorId],
      salesDate: [data.salesDate ? data.salesDate.substring(0, 10) : null, Validators.required],
      totalSales: [data.totalSales, [Validators.required, Validators.min(0)]],
      cashAmount: [data.cashAmount, [Validators.required, Validators.min(0)]],
      networkAmount: [data.networkAmount, [Validators.required, Validators.min(0)]],
      creditAmount: [data.creditAmount ?? 0, [Validators.min(0)]],
      grandTotal: [data.grandTotal, [Validators.required, Validators.min(0)]],
      difference: [{ value: data.difference, disabled: true }],
      supervisorNotes: [data.supervisorNotes || ''],
      // 🔥 مرفق اليومية (الهيدر)
      attachmentPath: [data.attachmentPath || ''],
      shortageDetails: this.fb.array([])
    });

    if (data.shortageDetails && data.shortageDetails.length > 0) {
      data.shortageDetails.forEach((row: any) => this.addEditShortageRow(row));
    }

    this.setupEditTotalsCalculation();
    this.recalcEditDifference();
  }

  get editShortageDetails(): FormArray {
    return this.editForm.get('shortageDetails') as FormArray;
  }

  private setupEditShortageRowLogic(group: FormGroup): void {
    // أول مرة بناءً على القيمة الحالية
    const currentTypeId = group.get('shortageTypeId')?.value;
    this.toggleEditEmployeeField(group, currentTypeId);

    group.get('shortageTypeId')?.valueChanges.subscribe(typeId => {
      this.toggleEditEmployeeField(group, typeId);
    });

    group.get('amount')?.valueChanges.subscribe(() => {
      this.recalcEditDifference();
    });
  }

  private toggleEditEmployeeField(row: FormGroup, typeId: number | null | undefined): void {
    const type = this.shortageTypes.find(t => t.id === typeId);
    const name = type?.name || '';

    const employeeCtrl = row.get('employeeId');
    const returnNotesCtrl = row.get('returnNotes');
    const discountNotesCtrl = row.get('discountNotes');
    const attachmentCtrl = row.get('attachmentPath');

    // 1) سحب أو مكافأة أو أي نوع فيه "موظف" → الموظف مطلوب
    if (employeeCtrl) {
      if (name.includes('موظف') || name.includes('مكا')) {
        employeeCtrl.setValidators([Validators.required]);
      } else {
        employeeCtrl.clearValidators();
        employeeCtrl.setValue(null);
      }
      employeeCtrl.updateValueAndValidity({ emitEvent: false });
    }

    // 2) مرتجعات → تظهر فقط بدون Required
    if (returnNotesCtrl) {
      if (name.includes('مرتجع') || name.includes('مرتجعات')) {
        returnNotesCtrl.clearValidators();
      } else {
        returnNotesCtrl.clearValidators();
        returnNotesCtrl.setValue('');
      }
      returnNotesCtrl.updateValueAndValidity({ emitEvent: false });
    }

    // 3) خصم → تظهر فقط بدون Required
    if (discountNotesCtrl) {
      if (name.includes('خصم')) {
        discountNotesCtrl.clearValidators();
      } else {
        discountNotesCtrl.clearValidators();
        discountNotesCtrl.setValue('');
      }
      discountNotesCtrl.updateValueAndValidity({ emitEvent: false });
    }

    // 4) مرفق العجز → اختياري لو النوع فيه "مسموح"
    if (attachmentCtrl) {
      if (name.includes('مسموح')) {
        attachmentCtrl.clearValidators();
      } else {
        attachmentCtrl.setValidators([Validators.required]);
      }
      attachmentCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  addEditShortageRow(row?: any): void {
    const group = this.fb.group({
      id: [row?.id || 0],
      shortageTypeId: [row?.shortageTypeId || null, Validators.required],
      amount: [row?.amount || null, [Validators.required, Validators.min(1)]],
      employeeId: [row?.employeeId || null],
      attachmentPath: [row?.attachmentPath || '', Validators.required],
      returnNotes: [row?.returnNotes || ''],
      discountNotes: [row?.discountNotes || '']
    });

    this.setupEditShortageRowLogic(group);
    this.editShortageDetails.push(group);
  }

  removeEditShortageRow(index: number): void {
    this.editShortageDetails.removeAt(index);
    this.recalcEditDifference();
  }

  getEditShortageControl(row: AbstractControl): FormControl {
    return row.get('shortageTypeId') as FormControl;
  }

  getEditEmployeeControl(row: AbstractControl): FormControl {
    return row.get('employeeId') as FormControl;
  }

  isReturnType(row: AbstractControl): boolean {
    const typeId = row.get('shortageTypeId')?.value;
    const type = this.shortageTypes.find(t => t.id === typeId);
    const name = type?.name || '';
    return name.includes('مرتجع') || name.includes('مرتجعات');
  }

  isDiscountType(row: AbstractControl): boolean {
    const typeId = row.get('shortageTypeId')?.value;
    const type = this.shortageTypes.find(t => t.id === typeId);
    const name = type?.name || '';
    return name.includes('خصم');
  }

  onEditShortageFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;

    const file = input.files[0];

    this.shortageAttachmentService.upload(file).subscribe({
      next: (path) => {
        this.editShortageDetails.at(index).get('attachmentPath')?.setValue(path);
      },
      error: () => {
        alert('حدث خطأ أثناء رفع مرفق العجز');
        this.editShortageDetails.at(index).get('attachmentPath')?.reset();
      }
    });
  }

  // 🔥 مرفق اليومية (الهيدر) فى نافذة التعديل
  onEditHeaderFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;

    const file = input.files[0];

    this.headerAttachmentService.uploadHeader(file).subscribe({
      next: (path) => {
        this.editForm.get('attachmentPath')?.setValue(path);
      },
      error: () => {
        alert('حدث خطأ أثناء رفع صورة اليومية');
        this.editForm.get('attachmentPath')?.reset();
      }
    });
  }

  // ============================
  // 🔥 حساب الفرق داخل نافذة التعديل
  // ============================
  setupEditTotalsCalculation(): void {
    this.editForm.get('cashAmount')?.valueChanges.subscribe(() => this.recalcEditDifference());
    this.editForm.get('networkAmount')?.valueChanges.subscribe(() => this.recalcEditDifference());
    this.editForm.get('creditAmount')?.valueChanges.subscribe(() => this.recalcEditDifference());
    this.editForm.get('grandTotal')?.valueChanges.subscribe(() => this.recalcEditDifference());
  }

  recalcEditDifference(): void {
    if (!this.editForm) return;

    const cash = Number(this.editForm.get('cashAmount')?.value || 0);
    const network = Number(this.editForm.get('networkAmount')?.value || 0);
    const credit = Number(this.editForm.get('creditAmount')?.value || 0);
    const grandTotal = Number(this.editForm.get('grandTotal')?.value || 0);

    let diffRaw = grandTotal - (cash + network + credit);

    let totalShortage = 0;
    this.editShortageDetails.controls.forEach(row => {
      const amount = Number(row.get('amount')?.value || 0);
      totalShortage -= amount;
    });

    diffRaw -= totalShortage;

    const diff = Number(diffRaw.toFixed(2));
    this.editForm.get('difference')?.setValue(diff, { emitEvent: false });
  }

  // ============================
  // 🔥 حفظ التعديلات
  // ============================
  saveEdit(): void {
    if (!this.editForm || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'من فضلك أكمل بيانات اليومية قبل الحفظ',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    const payload = this.editForm.getRawValue();

    this.dailyService.update(payload.id, payload).subscribe({
      next: () => {
        this.closeEditDialog();
        this.search();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم تعديل اليومية بنجاح',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'حدث خطأ أثناء حفظ التعديلات',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeEditDialog(): void {
    this.selectedDaily = null;
    this.editForm = undefined as any;
  }
details(id: number) {
  this.branchSalesDailyService.getById(id).subscribe({
    next: (res: any) => {
      this.selectedDailyDetails = res.data; // ← صح 100%
    }
  });
}




openDeleteDialog(id: number) {
  this.deleteId = id;
  this.showDeleteDialog = true;
}

closeDetailsDialog() {
  this.selectedDailyDetails = null;
}

closeDeleteDialog() {
  this.showDeleteDialog = false;
  this.deleteId = null;
}

deleteDaily() {
  if (!this.deleteId) return;

  this.branchSalesDailyService.delete(this.deleteId).subscribe({
    next: () => {
      this.closeDeleteDialog();
      this.search(); // أو loadData()
    }
  });
}

}
