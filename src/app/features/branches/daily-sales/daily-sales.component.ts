import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchSalesDailyService } from '../../../services/branch-sales-daily.service';
import { MasterDataService } from '../../../services/master-data.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { DailyHeaderAttachmentService } from '../../../services/daily-header-attachment.service';
import { ShortageAttachmentService } from '../../../services/shortage-attachment.service';
import Swal from 'sweetalert2';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-daily-sales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,CustomSelectComponent],
  templateUrl: './daily-sales.component.html'
})
export class DailySalesComponent implements OnInit {

  form!: FormGroup;
  isSaving = false;
  userInfo: any;
  branches: any[] = [];
  supervisors: any[] = [];
  employees: any[] = [];
  employeeOptions: { id: number; name: string }[] = [];

  shortageTypes: any[] = [];
  shortageTypeOptions: { id: number; name: string }[] = [];
  filteredBranches: any[] = [];
  filteredSupervisors: any[] = [];
  filteredEmployees: any[] = [];
  filteredShortageTypes: any[] = [];

  showShortageDropdown: boolean[] = [];
  showEmployeeDropdown: boolean[] = [];

  differenceLabel = signal<'زيادة' | 'عجز' | ''>('');
  isDifferencePositive = signal<boolean | null>(null);

  headerAttachmentFile: File | null = null;
  shortageFiles: { [index: number]: File | null } = {};

  branchNameDisplay = '';
  supervisorNameDisplay = '';
  salesDateDisplay = '';
  showSuccessPopup = false;

  grandTotal=0;
  totalSales = 0;
  credit = 0;
   cash=0;
   network=0;
  constructor(
    private fb: FormBuilder,
    private dailyService: BranchSalesDailyService,
    private master: MasterDataService,
    private auth: AuthService,
    private router: Router,
    private headerAttachmentService: DailyHeaderAttachmentService,
      private shortageAttachmentService: ShortageAttachmentService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    this.setTodayDate();
    this.setupTotalsCalculation();
    this.initHeaderFromUser();
      this.checkTodayExists();
      
  }
preventEnter(event: Event) {
  event.preventDefault();
}
  buildForm() {
    this.form = this.fb.group({
      branchId: [null, Validators.required],
      supervisorId: [null, Validators.required],
      salesDate: ['', Validators.required],

      noSalesToday: [false],
      isBalanced: [false],
      hasShortage: [false],
      attachmentPath: ['', Validators.required],

      totalSales: [null, [Validators.required, Validators.min(0)]],
      cashAmount: [null, [Validators.required, Validators.min(0)]],
      networkAmount: [null, [Validators.required, Validators.min(0)]],
      creditAmount: [null, [Validators.required, Validators.min(0)]],
      grandTotal: [null, [Validators.required, Validators.min(0)]],

      difference: [{ value: 0, disabled: true }],

      supervisorNotes: [''],

      totalInvoicesCount: [null, [Validators.required, Validators.min(0)]],
      totalQuantities: [null, [Validators.required, Validators.min(0)]],

      shortageDetails: this.fb.array([])
    });
  }

  initHeaderFromUser() {
   this.userInfo = this.auth.getUserInfo();
  const user = this.userInfo;
    if (!user || !user.branchId) return;

    this.form.get('branchId')?.setValue(user.branchId);
    this.branchNameDisplay = decodeURIComponent(escape(String(user.branchName || '')));

    const todayIso = new Date().toISOString().substring(0, 10);
    this.form.get('salesDate')?.setValue(todayIso);
    this.form.get('salesDate')?.disable({ emitEvent: false });
    this.salesDateDisplay = todayIso;

    this.master.getBranchById(user.branchId).subscribe(res => {
      const branch = res?.data;
      if (branch) {
        this.supervisorNameDisplay = branch.supervisorName || '';
        this.form.get('supervisorId')?.setValue(branch.supervisorId || null);
      }

      this.form.get('branchId')?.disable({ emitEvent: false });
      this.form.get('supervisorId')?.disable({ emitEvent: false });
    });
  }
checkTodayExists() {
  if (!this.userInfo || !this.userInfo.branchId) return;

  const branchId = this.userInfo.branchId;
  const todayIso = new Date().toISOString().substring(0, 10);

  this.dailyService.exists(branchId, todayIso).subscribe({
    next: exists => {
      if (exists) {
      Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'لقد قمت بإدخال يومية مبيعات لهذا الفرع في هذا التاريخ من قبل.',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
        this.router.navigate(['/dashboard']);
      }
    },
    error: err => {
      console.error(err);
      // ممكن تسيبها ساكتة أو تحط Alert عام
    }
  });
}
  get shortageDetails(): FormArray {
    return this.form.get('shortageDetails') as FormArray;
  }

  loadLookups() {
    this.master.getBranches().subscribe(res => {
      this.branches = res.data;
      this.filteredBranches = [...this.branches];

    });

    this.master.getEmployees().subscribe(res => {
      this.employees = res.data;
      this.filteredEmployees = [...this.employees];

      this.supervisors = this.employees.filter((x: any) => x.isSupervisor);
      this.filteredSupervisors = [...this.supervisors];
        // 🔥 هنا بنجهز الداتا للدروب داون الموظف
  this.employeeOptions = this.employees.map((emp: any) => ({
    id: emp.id,
    name: emp.fullName
  }));
    });

      this.master.getShortageTypes().subscribe({
        next: res => {

          this.shortageTypes = res.data || [];
          this.filteredShortageTypes = [...this.shortageTypes];

          // 🔥 هنا بنعمل normalization للدروب داون
          this.shortageTypeOptions = this.shortageTypes.map(t => ({
            id: t.id,
            name: t.shortageName   // ← لأن الـ API بيرجع shortageName فقط
          }));

        },
        error: err => {
          console.error("❌ Error loading shortage types:", err);
        }
      });

  }

 addShortageRow() {
  if (this.shortageDetails.length > 0) {
    const last = this.shortageDetails.at(this.shortageDetails.length - 1);
    if (last.invalid) {
      alert('من فضلك أكمل بيانات العجز قبل إضافة صف جديد');
      last.markAllAsTouched();
      return;
    }
  }

  const row = this.fb.group({
    shortageTypeId: [null, Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
    employeeId: [null],
    attachmentPath: ['', Validators.required],
    returnNotes: [''],      // بدون Validators
    discountNotes: ['']     // بدون Validators
  });

  row.get('shortageTypeId')?.valueChanges.subscribe(typeId => {
    this.toggleEmployeeField(row, typeId);
  });

  row.get('amount')?.valueChanges.subscribe(() => {
    this.recalculateShortageEffect();
  });

  this.shortageDetails.push(row);
}

  removeShortageRow(index: number) {
    this.shortageDetails.removeAt(index);
    this.showShortageDropdown.splice(index, 1);
    this.showEmployeeDropdown.splice(index, 1);
    delete this.shortageFiles[index];
    this.recalculateShortageEffect();
  }

 toggleEmployeeField(row: FormGroup, typeId: number | null | undefined) {
  const type = this.shortageTypes.find(t => t.id === typeId);
  const name = type?.name || type?.shortageName || '';

  // 1) سحب أو مكافأة → الموظف مطلوب
  if (name.includes('موظف') || name.includes('مكا')  ) {
    row.get('employeeId')?.setValidators([Validators.required]);
  } else {
    row.get('employeeId')?.clearValidators();
    row.get('employeeId')?.setValue(null);
  }

  // 2) مرتجعات → تظهر فقط بدون Required
  if (name.includes('مرتجع') || name.includes('مرتجعات')) {
    row.get('returnNotes')?.clearValidators();
  } else {
    row.get('returnNotes')?.clearValidators();
    row.get('returnNotes')?.setValue('');
  }

  // 3) خصم → تظهر فقط بدون Required
  if (name.includes('خصم')) {
    row.get('discountNotes')?.clearValidators();   // ← هنا كان الخطأ
  } else {
    row.get('discountNotes')?.clearValidators();
    row.get('discountNotes')?.setValue('');
  }

  row.get('employeeId')?.updateValueAndValidity();
  row.get('returnNotes')?.updateValueAndValidity();
  row.get('discountNotes')?.updateValueAndValidity();
}



  goBackToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  setTodayDate() {
    const today = new Date();
    const iso = today.toISOString().substring(0, 10);
    this.form.get('salesDate')?.setValue(iso);
  }

  onHeaderFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.headerAttachmentFile = file;

    this.headerAttachmentService.uploadHeader(file).subscribe({
      next: (path) => {
        this.form.get('attachmentPath')?.setValue(path);
      },
      error: (err) => {
        console.error(err);
        alert('حدث خطأ أثناء رفع صورة اليومية');
        this.form.get('attachmentPath')?.reset();
        this.headerAttachmentFile = null;
      }
    });
  }

onShortageFileSelected(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (!input?.files || input.files.length === 0) return;

  const file = input.files[0];
  this.shortageFiles[index] = file;

  this.shortageAttachmentService.upload(file).subscribe({
    next: (path) => {
      this.shortageDetails.at(index).get('attachmentPath')?.setValue(path);
    },
    error: () => {
      alert('حدث خطأ أثناء رفع مرفق العجز');
      this.shortageDetails.at(index).get('attachmentPath')?.reset();
      this.shortageFiles[index] = null;
    }
  });
}


  setupTotalsCalculation() {
    this.form.get('cashAmount')?.valueChanges.subscribe(() => this.recalculateTotals());
    this.form.get('networkAmount')?.valueChanges.subscribe(() => this.recalculateTotals());
    this.form.get('creditAmount')?.valueChanges.subscribe(() => this.recalculateTotals());
    this.form.get('grandTotal')?.valueChanges.subscribe(() => this.recalculateDifference());
  }

  recalculateTotals() {
     this.cash = Number(this.form.get('cashAmount')?.value || 0);
     this.network = Number(this.form.get('networkAmount')?.value || 0);
    this.credit = Number(this.form.get('creditAmount')?.value || 0);
     this.totalSales = Number(this.form.get('totalSales')?.value || 0);
   

    this.recalculateDifference();
  }

  recalculateDifference() {
    this.totalSales = Number(this.form.get('totalSales')?.value || 0);
     this.grandTotal = Number(this.form.get('grandTotal')?.value || 0);
    this.cash = Number(this.form.get('cashAmount')?.value || 0);
     this.network = Number(this.form.get('networkAmount')?.value || 0);
    this.credit = Number(this.form.get('creditAmount')?.value || 0);

    const diff = this.grandTotal - (this.cash+this.network + this.credit);
    this.form.get('difference')?.setValue(diff, { emitEvent: false });

    this.updateDifferenceStatus(diff);
   
    this.recalculateShortageEffect();
    if (diff < 0) {
      this.form.get('isBalanced')?.setValue(false);
      this.form.get('hasShortage')?.setValue(true);
    } else if (diff === 0) {
      this.form.get('isBalanced')?.setValue(true);
      this.form.get('hasShortage')?.setValue(false);
    } else {
      this.form.get('isBalanced')?.setValue(false);
      this.form.get('hasShortage')?.setValue(false);
    }
  }

  updateDifferenceStatus(diff: number) {
    if (diff > 0) {
      this.differenceLabel.set('زيادة');
      this.isDifferencePositive.set(true);
    } else if (diff < 0) {
      this.differenceLabel.set('عجز');
      this.isDifferencePositive.set(false);
    } else {
      this.differenceLabel.set('');
      this.isDifferencePositive.set(null);
    }
  }

recalculateShortageEffect() {
   this.totalSales = Number(this.form.get('totalSales')?.value || 0);
   this.credit = Number(this.form.get('creditAmount')?.value || 0);
   this.grandTotal = Number(this.form.get('grandTotal')?.value || 0);

  // الفرق الأساسي قبل العجز
  let diff =(this.cash +this.network+ this.credit)- this.grandTotal ;

  // طرح مجموع العجز
  let totalShortage = 0;
  this.shortageDetails.controls.forEach(row => {
    const amount = Number(row.get('amount')?.value || 0);
    totalShortage -= amount;
  });

  diff -= totalShortage;

  this.form.get('difference')?.setValue(diff, { emitEvent: false });
  this.updateDifferenceStatus(diff);
}


save() {
  const noSales = this.form.get('noSalesToday')?.value;

  // 🔹 نفس الفاليديشن لكن بـ Toast بدل alert
  if (!noSales && this.form.invalid) {
    this.form.markAllAsTouched();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: 'من فضلك أكمل جميع الحقول المطلوبة',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    });
    return;
  }

  if (!this.headerAttachmentFile) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: 'يجب إرفاق صورة اليومية',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    });
    return;
  }

  // 🔥 شرط جديد: لو اليوم ليس No Sales → لازم واحدة من الثلاثة > 0
  if (!noSales) {
    const cash = Number(this.form.get('cashAmount')?.value || 0);
    const network = Number(this.form.get('networkAmount')?.value || 0);
    const credit = Number(this.form.get('creditAmount')?.value || 0);
   const GrandTotal = Number(this.form.get('grandTotal')?.value || 0);
    if (GrandTotal <= 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'يجب إدخال الاجمالى الكلى.',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
      return;
    }
    
    if (cash <= 0 && network <= 0 && credit <= 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'يجب إدخال قيمة في النقدية أو الشبكة أو الآجل قبل الحفظ.',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
      return;
    }
  }

  const diff = Number(this.form.get('difference')?.value || 0);

if (!noSales && diff < 0 && Math.abs(diff) >= 50) {
  if (this.shortageDetails.length === 0) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: 'يجب إدخال تفاصيل العجز قبل الحفظ',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    });
    return;
  }
}
  // 🔥 هنا بنعمل Check قبل الحفظ
  const branchId = this.form.get('branchId')?.value;
  const salesDate = this.form.get('salesDate')?.value;

  if (!branchId || !salesDate) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'بيانات الفرع أو التاريخ غير صحيحة',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    });
    return;
  }

  // 🔥 اسأل الباك إند: هل اليومية موجودة؟
  this.dailyService.exists(branchId, salesDate).subscribe({
    next: exists => {
      if (exists) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'لقد قمت بإدخال يومية مبيعات لهذا الفرع في هذا التاريخ من قبل.',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
        return; // ❌ وقف الحفظ
      }

      // ✔ لو مفيش تكرار → نكمل الحفظ
      this.doSave();
    },
    error: err => {
      console.error(err);
      // لو حصل Error في exists، نكمل الحفظ عادي
      this.doSave();
    }
  });
}


private doSave() {
  this.isSaving = true;

  const payload = {
    ...this.form.getRawValue()
  };
if (payload.shortageDetails && payload.shortageDetails.length > 0) {
  payload.shortageDetails = payload.shortageDetails.map((row: any) => ({
    ...row,
    isReturnApproved: false,
    isDiscountApproved: false,
  returnNotes: (row.returnNotes && row.returnNotes.trim() !== '') 
                ? row.returnNotes 
                : 'لا يوجد ملاحظات',

  discountNotes: (row.discountNotes && row.discountNotes.trim() !== '') 
                ? row.discountNotes 
                : 'لا يوجد ملاحظات',
    employeeId: row.employeeId || null
  }));
}
  this.dailyService.create(payload).subscribe({
    next: res => {
      this.isSaving = false;

      // 🔥 لو الباك إند رجّع Fail برسالة (من CreateAsync)
      if (res && res.success === false && res.message) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: res.message,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
        return;
      }

      this.showSuccessPopup = true;

      setTimeout(() => {
        this.showSuccessPopup = false;
        this.router.navigate(['/dashboard']);
      }, 2500);
    },
    error: err => {
      this.isSaving = false;
      console.error(err);

      // 🔥 لو الباك إند رجّع رسالة "تم تسجيل يومية..."
      if (err.error && err.error.message) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: err.error.message,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
      } else {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'حدث خطأ أثناء الحفظ',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
      }
    }
  });
}

isReturnType(row: AbstractControl): boolean {
  const typeId = row.get('shortageTypeId')?.value;
  const type = this.shortageTypes.find(t => t.id === typeId);
  const name = type?.name || type?.shortageName || '';
  return name.includes('مرتجع') || name.includes('مرتجعات');
}

isDiscountType(row: AbstractControl): boolean {
  const typeId = row.get('shortageTypeId')?.value;
  const type = this.shortageTypes.find(t => t.id === typeId);
  const name = type?.name || type?.shortageName || '';
  return name.includes('خصم');
}
getShortageControl(row: AbstractControl): FormControl {
    return row.get('shortageTypeId') as FormControl;
  }

  getEmployeeControl(row: AbstractControl): FormControl {
  return row.get('employeeId') as FormControl;
}
}
