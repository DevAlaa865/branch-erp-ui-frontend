import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseVoucherService } from '../../../services/Expenses/expense-voucher.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-expense-voucher-line-approval',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './expense-voucher-line-approval.component.html',
})
export class ExpenseVoucherLineApprovalComponent implements OnInit {

  lineId!: number;
  role: number = 2; // Accountant default
  notes: string = '';
  approvedByUserId: string = 'alaa';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ExpenseVoucherService
  ) {}

  ngOnInit(): void {
    this.lineId = Number(this.route.snapshot.paramMap.get('lineId'));
  }

  approve() {
    const dto = {
      lineId: this.lineId,
      role: this.role,
      approvedByUserId: this.approvedByUserId,
      notes: this.notes
    };

    this.service.approveLine(dto).subscribe({
      next: () => this.router.navigate(['/expense-vouchers']),
      error: err => console.error(err)
    });
  }
}
