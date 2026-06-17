import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import SignaturePad from 'signature_pad';

import { Router } from '@angular/router';

import { BankTransferRequestService } from '../../../services/bank-transfer-request.service';
import { MasterDataService } from '../../../services/master-data.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-bank-transfer-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent
  ],
  templateUrl: './bank-transfer-request-form.component.html'
})
export class BankTransferRequestFormComponent
  implements OnInit, AfterViewInit {

  form!: FormGroup;
  loading = false;
  branches: any[] = [];

  @ViewChild('signatureCanvas')
  signatureCanvas!: ElementRef<HTMLCanvasElement>;

  private signaturePad!: SignaturePad;

  constructor(
    private fb: FormBuilder,
    private service: BankTransferRequestService,
    private branchService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
  }

  ngAfterViewInit(): void {
    // ننتظر حتى يتم رسم الصفحة بالكامل
    setTimeout(() => {
      this.initializeSignaturePad();
    }, 100);
  }

  // ============================
  // Signature Pad
  // ============================
initializeSignaturePad(): void {
  const canvas = this.signatureCanvas.nativeElement;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;

        this.signaturePad = new SignaturePad(canvas, {
          backgroundColor: '#ffffff',
          penColor: '#000000',
          minWidth: 1.2,
          maxWidth: 2.5,
          throttle: 0,
          velocityFilterWeight: 0.7
        });

        observer.disconnect(); // نوقف المراقبة بعد النجاح
      }
    }
  });

  observer.observe(canvas);
}


  clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  // ============================
  // Branches
  // ============================
  loadBranches(): void {
    this.branchService.getBranches().subscribe({
      next: (res: any) => {
        this.branches = res.data ?? [];
      },
      error: (err) => console.error(err)
    });
  }

  // ============================
  // Form
  // ============================
  buildForm(): void {
    this.form = this.fb.group({
      branchId: [null, Validators.required],
      invoiceNumber: ['', Validators.required],
      invoiceAmount: [null, [Validators.required, Validators.min(1)]],
      transferType: [1, Validators.required],
      transferAmount: [null, [Validators.required, Validators.min(1)]],
      customerName: ['', Validators.required],
      customerMobile: ['', [Validators.required, Validators.minLength(8)]],
      bankName: ['', Validators.required],
      iban: ['', Validators.required],
      applicantSignature: ['', Validators.required],
      notes: ['']
    });
  }

  // ============================
  // Save
  // ============================
save(): void {

  if (!this.signaturePad) {
    alert('حدث خطأ في التوقيع');
    return;
  }

  if (this.signaturePad.isEmpty()) {
    alert('يرجى توقيع مقدم الطلب');
    return;
  }

  // حط التوقيع الأول
  const signatureBase64 =
    this.signaturePad.toDataURL('image/png');

  this.form.patchValue({
    applicantSignature: signatureBase64
  });

  // حدث الـ validation
  this.form.updateValueAndValidity();

  console.log(this.form.value);
  console.log(this.form.valid);

  // بعد إضافة التوقيع افحص الفورم
  if (this.form.invalid) {

    console.log(this.form.controls);

    this.form.markAllAsTouched();

    return;
  }

  this.loading = true;

  this.service.create(this.form.value)
    .subscribe({
      next: () => {

        alert('تم حفظ الطلب بنجاح');

        this.form.reset();

        this.form.patchValue({
          transferType: 1
        });

        this.signaturePad.clear();

        this.loading = false;
      },
      error: err => {

        console.error(err);

        this.loading = false;

        alert('حدث خطأ أثناء الحفظ');
      }
    });

}

}
