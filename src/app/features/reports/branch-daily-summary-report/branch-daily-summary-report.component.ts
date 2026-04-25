import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { Router } from '@angular/router';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-branch-daily-summary-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './branch-daily-summary-report.component.html',
  styleUrls: ['./branch-daily-summary-report.component.css']
})
export class BranchDailySummaryReportComponent implements OnInit {

  form!: FormGroup;

  cities: any[] = [null];
  activityTypes: any[] = [null];

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  get cityIdsControl(): FormControl {
    return this.form.get('cityIds') as FormControl;
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadMasterData();
  }

  buildForm(): void {
    this.form = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      cityIds: [[]],
      activityTypeId: [null],
      branchType: ['All'],
      onlyWithShortage: [false]
    });

    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({
      fromDate: today,
      toDate: today
    });
  }

  loadMasterData(): void {
    this.masterDataService.getCities().subscribe({
      next: (res: any) => this.cities = res.data || [],
      error: () => console.error('خطأ في تحميل المدن')
    });

    this.masterDataService.getActivityTypes().subscribe({
      next: (res: any) => this.activityTypes = res.data || [],
      error: () => console.error('خطأ في تحميل الأنشطة')
    });
  }

  goToResult(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'من فضلك أكمل بيانات الفترة أولاً.';
      return;
    }

    const raw = this.form.value;

    this.router.navigate(
      ['/reports/branch-daily-summary/result'],
      {
        queryParams: {
          fromDate: raw.fromDate,
          toDate: raw.toDate,
          branchType: raw.branchType,
          onlyWithShortage: raw.onlyWithShortage,
          activityTypeId: raw.activityTypeId || null,
          cityIds: raw.cityIds && raw.cityIds.length ? raw.cityIds : null
        }
      }
    );
  }
}
