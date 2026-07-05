import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UserCashCityService } from '../../services/Expenses/user-cash-city.service';
import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { CashPostingResultDto, PostDailyCashRequestDto } from '../../shared/models/cash-posting.model';
import { CashPostingService } from '../../services/Expenses/cash-posting.service';

@Component({
  selector: 'app-cash-posting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './cash-posting.component.html',
  styleUrls: ['./cash-posting.component.css']
})
export class PostingComponent implements OnInit {

  form!: FormGroup;

  users: any[] = [];
  userCities: any[] = [];

  loading = false;
  result: CashPostingResultDto | null = null;
  toastMessage = '';
  showDetails: boolean[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CashPostingService,
    private userCashService: UserCashCityService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadUsers();
  }

  private getToday(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  buildForm() {
    this.form = this.fb.group({
      userId: [''],
      date: [this.getToday()]
    });
  }

  loadUsers() {
    this.userCashService.getUsers().subscribe(res => {
      this.users = res.success ? res.data : [];
    });
  }

  onUserChange() {
    const userId = this.form.value.userId;
    if (userId) {
      this.userCashService.getUserCashCities(userId).subscribe(res => {
        this.userCities = res.success ? res.data : [];
      });
    }
  }

  toggleDetails(index: number) {
    this.showDetails[index] = !this.showDetails[index];
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.result = null;
    this.toastMessage = '';

    const body: PostDailyCashRequestDto = this.form.value;

    console.log("📤 Request Body:", body);

    this.service.postDailyCash(body).subscribe({
      next: res => {
        console.log("📥 API Response:", res);

        this.result = res;
        this.loading = false;

        if (!res || !res.cities || res.cities.length === 0) {
          this.toastMessage = '⚠ لا توجد بيانات للترحيل';
          setTimeout(() => this.toastMessage = '', 5000);
          return;
        }

        // 🔥 بناء رسالة الترحيل
        let message = '✔ تم ترحيل النقدية بنجاح\n\n';

        res.cities.forEach(city => {
          message += `${city.cityName}:\n`;

          if (city.totalDailyCash > 0) {
            message += `- إجمالي النقدية: ${city.totalDailyCash.toLocaleString()} ريال\n`;
          }

          if (city.hasMissingBranches && city.missingBranches?.length > 0) {
            message += `- فروع ناقصة: ${city.missingBranches.join('، ')}\n`;
          }

          if (city.alreadyPosted) {
            message += `- تم الترحيل مسبقًا لهذا التاريخ\n`;
          }

          if (!city.cashBoxId) {
            message += `- لا يوجد صندوق مسؤول إيداع\n`;
          }

          message += '\n';
        });

        this.toastMessage = message;

        setTimeout(() => this.toastMessage = '', 8000);
      },

      error: () => {
        this.toastMessage = '❌ حدث خطأ أثناء الترحيل';
        this.loading = false;
        setTimeout(() => this.toastMessage = '', 120000);
      }
    });
  }
}
