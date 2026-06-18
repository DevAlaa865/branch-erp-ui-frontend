import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { BankTransferRequestService } from '../../../services/bank-transfer-request.service';

@Component({
  selector: 'app-bank-transfer-request-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-transfer-request-print.component.html',
  styleUrls: ['./bank-transfer-request-print.component.css']
})
export class BankTransferRequestPrintComponent implements OnInit {

  request: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private service: BankTransferRequestService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.service.getById(id).subscribe({
      next: (res: any) => {

        this.request = res.data ?? res;

        this.loading = false;

        setTimeout(() => {
          window.print();
        }, 1000);
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

}