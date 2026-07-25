import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';

import { BranchMonthlyTargetSeasonService } from '../../../../../services/branch-monthly-target-season.service';
import { BranchMonthlyTargetSeasonExcelUploadDto } from '../../../../../shared/models/branch-monthly-target-season.model';

@Component({
  selector: 'app-monthly-target-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-target-upload.component.html',
  styleUrls: ['./monthly-target-upload.component.css']
})
export class MonthlyTargetUploadComponent {

  selectedFile: File | null = null;
  message = '';

  constructor(private monthlyService: BranchMonthlyTargetSeasonService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  upload() {
    if (!this.selectedFile) {
      this.message = 'من فضلك اختر ملف أولاً';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const dto: BranchMonthlyTargetSeasonExcelUploadDto = {
        rows: rows.map(r => ({
          branchNumber: Number(r['BranchNumber']),
          targetMonth: Number(r['TargetMonth']),
          targetYear: Number(r['TargetYear']),
          monthlyTargetAmount: Number(r['MonthlyTargetAmount']),
          notes: r['Notes'] ?? ''
        }))
      };

      console.log('Monthly DTO:', JSON.stringify(dto, null, 2));

      this.monthlyService.uploadExcel(dto).subscribe({
        next: () => {
          this.message = 'تم رفع ملف التارجت الشهري بنجاح ✔';
          this.selectedFile = null;
        },
        error: (err) => {
          console.error(err);
          this.message = 'حدث خطأ أثناء رفع الملف ❌';
        }
      });
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }
}
