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

import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-bank-transfer-request-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
    HasPermissionDirective
  ],
  templateUrl: './bank-transfer-request-list.component.html',
  styleUrls: ['./bank-transfer-request-list.component.css']
})
export class BankTransferRequestListComponent implements OnInit {

  filterForm!: FormGroup;

  loading = false;

  branches: any[] = [];

  requests: any[] = [];
  pagedRequests: any[] = [];

  // Pagination
  page = 1;
  pageSize = 10;
  totalPages = 0;

  // للحالة الجديدة عند التعديل
  statusOptions = [
    { id: 1, name: 'معلق' },
    { id: 2, name: 'تم التحويل' },
    { id: 3, name: 'ملغي' }
  ];

  selectedRequest: any = null;
  statusForm!: FormGroup;
  detailsRequest: any = null;

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
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      requestNumber: [''],
      branchId: [null],
      invoiceNumber: [''],
      customerName: [''],
      customerMobile: [''],
      iban: [''],
      status: [null],

      fromRequestDate: [formattedDate],
      toRequestDate: [formattedDate],

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
        this.setupPagination();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // ============================
  // Clean Filter
  // ============================
  cleanFilter(filter: any) {
    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === '' ||
        filter[key] === undefined
      ) {
        delete filter[key];
      }
    });
    return filter;
  }

  // ============================
  // Fix Dates (اليوم كامل)
  // ============================
  fixFromDate(date: string | null): string | null {
    if (!date) return null;
    return date + "T00:00:00";
  }

  fixToDate(date: string | null): string | null {
    if (!date) return null;
    return date + "T23:59:59";
  }

  // ============================
  // Search
  // ============================
  search(): void {
    this.loading = true;

    let filter = { ...this.filterForm.value };

    // تعديل التواريخ ليوم كامل
    filter.fromRequestDate = this.fixFromDate(filter.fromRequestDate);
    filter.toRequestDate = this.fixToDate(filter.toRequestDate);

    filter.fromTransferDate = this.fixFromDate(filter.fromTransferDate);
    filter.toTransferDate = this.fixToDate(filter.toTransferDate);

    // تنظيف الفلتر
    filter = this.cleanFilter(filter);

    console.log('FILTER => ', filter);

    this.service.search(filter).subscribe({
      next: (res: any) => {
        this.requests = res.data ?? [];
        this.setupPagination();
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
  // Pagination Logic
  // ============================
  setupPagination(): void {
    this.page = 1;
    this.totalPages = Math.ceil(this.requests.length / this.pageSize);
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRequests = this.requests.slice(start, end);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.updatePagedData();
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
      next: () => {
        alert('تم تحديث حالة الطلب بنجاح');
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

  openDetailsModal(request: any): void {
    this.detailsRequest = request;
  }

  closeDetailsModal(): void {
    this.detailsRequest = null;
  }

  printRequest(): void {
    const printContents =
      document.getElementById('printArea')?.innerHTML;

    const popup = window.open('', '_blank', 'width=900,height=700');

    popup?.document.write(`
      <html dir="rtl">
        <head>
          <title>طلب تحويل بنكي</title>

          <style>
            body{
              font-family: Tahoma;
              padding:20px;
              direction:rtl;
            }
            .section{
              border:1px solid #ccc;
              margin-bottom:15px;
              border-radius:8px;
            }
            .title{
              background:#f3f4f6;
              padding:10px;
              font-weight:bold;
            }
            .content{
              padding:12px;
            }
            img{
              max-height:120px;
            }
          </style>

        </head>

        <body>
          ${printContents}
        </body>

      </html>
    `);

    popup?.document.close();

    setTimeout(() => {
      popup?.print();
      popup?.close();
    }, 500);
  }

  openPrintPage(): void {
    if (!this.detailsRequest) return;

    window.open(
      `/bank-transfer-request/print/${this.detailsRequest.id}`,
      '_blank'
    );
  }

openAttachment(path: string): void {
  if (!path) return;

  const fullUrl = `https://alaaeng123-001-site1.rtempurl.com/${path}`;
  window.open(fullUrl, "_blank");
}


printAttachment(path: string): void {
  if (!path) return;

  const fullUrl = `https://alaaeng123-001-site1.rtempurl.com/${path}`;
  const win = window.open(fullUrl, "_blank");
  win?.print();
}

}
