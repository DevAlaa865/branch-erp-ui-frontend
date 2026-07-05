import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { ExpenseVoucher } from '../../../shared/models/expense-voucher.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-expense-voucher-details',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './expense-voucher-details.component.html',
})
export class ExpenseVoucherDetailsComponent implements OnInit {

  voucher!: ExpenseVoucher;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ExpenseVoucherService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadVoucher(id);
  }

  loadVoucher(id: number) {
    this.loading = true;

    this.service.getById(id).subscribe({
      next: res => {
        this.voucher = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  approveVoucher() {
    const dto = {
      voucherId: this.voucher.id,
      approvedByUserId: 'alaa', // هتتغير حسب اليوزر
      managerNotes: ''
    };

    this.service.approve(dto).subscribe({
      next: () => this.router.navigate(['/expense-vouchers']),
      error: err => console.error(err)
    });
  }

  approveLine(lineId: number) {
    this.router.navigate(['/expense-vouchers', lineId, 'approve-line']);
  }
}
