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

  selectedFile: File | null = null;   // ⭐ الملف يتخزن مؤقتًا فقط

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

          observer.disconnect();
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
      notes: [''],
      attachmentPath: ['']   // ⭐ موجود لكن مش هنستخدمه قبل الحفظ
    });
  }

  // ============================
  // File Select (بدون رفع)
  // ============================
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
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

    const signatureBase64 =
      this.signaturePad.toDataURL('image/png');

    this.form.patchValue({
      applicantSignature: signatureBase64
    });

    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // ⭐ 1) احفظ الطلب أولاً
    this.service.create(this.form.value)
      .subscribe({
        next: (res: any) => {

          const requestId = res.data?.id;

          // ⭐ 2) لو مفيش ملف → خلص
          if (!this.selectedFile) {
            this.finishSuccess();
            return;
          }

          // ⭐ 3) ارفع الملف بعد الحفظ
          this.service.uploadAttachment(requestId, this.selectedFile)
            .subscribe({
              next: (uploadRes: any) => {

                const path = uploadRes.path;

                // ⭐ 4) حدّث الطلب بالـ path
                this.service.updateAttachment(requestId, path)
                  .subscribe({
                    next: () => this.finishSuccess(),
                    error: () => this.finishError()
                  });

              },
              error: () => this.finishError()
            });

        },
        error: () => this.finishError()
      });

  }

  finishSuccess() {
    alert('تم حفظ الطلب بنجاح');

    this.form.reset();
    this.form.patchValue({ transferType: 1 });
    this.signaturePad.clear();
    this.selectedFile = null;

    this.loading = false;
    this.router.navigate(['/bank-transfer-request/list']);
  }

  finishError() {
    alert('حدث خطأ أثناء الحفظ');
    this.loading = false;
  }

}
