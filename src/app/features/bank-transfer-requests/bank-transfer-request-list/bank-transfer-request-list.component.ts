import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { BankTransferRequestService } from '../../../services/bank-transfer-request.service';
import { MasterDataService } from '../../../services/master-data.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-bank-transfer-request-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent
  ],
  templateUrl: './bank-transfer-request-list.component.html'
})
export class BankTransferRequestListComponent implements OnInit {

  filterForm!: FormGroup;

  loading = false;

  branches: any[] = [];

  requests: any[] = [];

  // للحالة الجديدة عند التعديل
  statusOptions = [
    { id: 1, name: 'معلق' },
    { id: 2, name: 'تم التحويل' },
    { id: 3, name: 'ملغي' }
  ];

  // مودال بسيط لتغيير الحالة
  selectedRequest: any = null;
  statusForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: BankTransferRequestService,
    private branchService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildFilterForm();
    this.buildStatusForm();
    this.loadBranches();
    this.loadPending();
  }

  // ============================
  // Forms
  // ============================
  buildFilterForm(): void {
    this.filterForm = this.fb.group({
      requestNumber: [''],
      branchId: [null],
      invoiceNumber: [''],
      customerName: [''],
      customerMobile: [''],
      iban: [''],
      status: [null],
      fromRequestDate: [null],
      toRequestDate: [null],
      fromTransferDate: [null],
      toTransferDate: [null]
    });
  }

  buildStatusForm(): void {
    this.statusForm = this.fb.group({
      status: [null],
      transferReferenceNumber: ['']
    });
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
  // Load Pending
  // ============================
  loadPending(): void {
    this.loading = true;

    this.service.getPending().subscribe({
      next: (res: any) => {
        this.requests = res.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // ============================
  // Search
  // ============================
  search(): void {
    this.loading = true;

    const filter = { ...this.filterForm.value };

    this.service.search(filter).subscribe({
      next: (res: any) => {
        this.requests = res.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.loadPending();
  }

  // ============================
  // Status Update
  // ============================
  openStatusModal(request: any): void {
    this.selectedRequest = request;

    this.statusForm.patchValue({
      status: request.status,
      transferReferenceNumber: request.transferReferenceNumber ?? ''
    });
  }

  closeStatusModal(): void {
    this.selectedRequest = null;
    this.statusForm.reset();
  }

  saveStatus(): void {
    if (!this.selectedRequest) return;

    const dto = {
      requestId: this.selectedRequest.id,
      status: this.statusForm.value.status,
      transferReferenceNumber: this.statusForm.value.transferReferenceNumber
    };

    this.loading = true;

    this.service.updateStatus(dto).subscribe({
      next: (res: any) => {
        alert('تم تحديث حالة الطلب بنجاح');

        // نحدّث في الليستة الحالية
        this.search();

        this.closeStatusModal();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('حدث خطأ أثناء تحديث الحالة');
        this.loading = false;
      }
    });
  }

}
