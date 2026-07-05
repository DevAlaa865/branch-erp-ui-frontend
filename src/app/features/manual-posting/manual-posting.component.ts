import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { CashPostingService } from '../../services/Expenses/cash-posting.service';
import { DepositCollectorService } from '../../services/Expenses/deposit-collector.service';
import { MasterDataService } from '../../services/master-data.service';
import { ManualPostingRequest, ManualPostingResult } from '../../shared/models/manual-posting.model';

@Component({
  selector: 'app-manual-posting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './manual-posting.component.html',
  styleUrls: ['./manual-posting.component.css']
})
export class ManualPostingComponent implements OnInit {

  form!: FormGroup;

  branches: any[] = [];
  collectors: any[] = [];

  result: ManualPostingResult | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private postingService: CashPostingService,
    private masterData: MasterDataService,
    private depositCollectorService: DepositCollectorService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
    this.loadCollectors();
  }

  // 🔥 نفس دالة التاريخ من Cash Posting
  private getToday(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  buildForm() {
    this.form = this.fb.group({
      branchId: [null],
      date: [this.getToday()],   // 🔥 نفس Cash Posting
      depositCollectorId: [null],
      amount: [null]             // 🔥 المبلغ اليدوي الجديد
    });
  }

  loadBranches() {
    this.masterData.getBranches().subscribe(res => {
      this.branches = res.success ? res.data : [];
    });
  }

  loadCollectors() {
    this.depositCollectorService.getAll(true).subscribe(res => {
      console.log("Collectors API Response:", res);
      this.collectors = Array.isArray(res) ? res : [];
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.result = null;

    const body: ManualPostingRequest = this.form.value;

    this.postingService.manualPost(body).subscribe({
      next: (res) => {
        this.loading = false;
        this.result = res;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
