import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { ExpenseVoucher } from '../../../shared/models/expense-voucher.model';
import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-voucher-list',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './expense-voucher-list.component.html',
})
export class ExpenseVoucherListComponent implements OnInit {

  vouchers: ExpenseVoucher[] = [];
  loading = true;

  constructor(
    private service: ExpenseVoucherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.service.getAll().subscribe({
      next: res => {
        this.vouchers = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openDetails(id: number) {
    this.router.navigate(['/expense-vouchers', id]);
  }

  createNew() {
    this.router.navigate(['/cash-management/expenses/expense-voucher/create']);
  }
}
