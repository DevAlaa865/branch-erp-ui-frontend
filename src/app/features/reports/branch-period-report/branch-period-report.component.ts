import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BranchTargetPeriodReport } from '../../../shared/models/branch-target-period-report.model';
import { BranchDailyTargetService } from '../../../services/branch-daily-target.service';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-branch-period-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent
  ],
  templateUrl: './branch-period-report.component.html',
  styleUrls: ['./branch-period-report.component.css']
})
export class BranchPeriodReportComponent implements OnInit {

  cityOptions: any[] = [];
  branchOptions: any[] = [];

  filterForm!: FormGroup;

  reportData: BranchTargetPeriodReport | null = null;

  constructor(
    private fb: FormBuilder,
    private targetService: BranchDailyTargetService
  ) {}

  ngOnInit(): void {

    // 1) بناء الفورم
    this.filterForm = this.fb.group({
      cityId: [null],
      branchId: [null],
      fromDate: [null],
      toDate: [null]
    });

    // 2) ضبط تاريخ اليوم بصيغة YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    this.filterForm.patchValue({
      fromDate: today,
      toDate: today
    });
  }

  loadReport() {
    const { branchId, fromDate, toDate } = this.filterForm.value;

    this.targetService
      .getBranchPeriodReport(branchId, fromDate, toDate)
      .subscribe((res: any) => {
        this.reportData = res;
      });
  }
}
