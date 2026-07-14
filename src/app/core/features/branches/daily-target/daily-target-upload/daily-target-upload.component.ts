import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { BranchDailyTargetSeasonService } from '../../../../../services/branch-daily-target.service';
import { BranchDailyTargetSeasonExcelUploadDto } from '../../../../../shared/models/branch-daily-target-season.model';

@Component({
  selector: 'app-daily-target-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-target-upload.component.html',
  styleUrls: ['./daily-target-upload.component.css']
})
export class DailyTargetUploadComponent {

  selectedFile: File | null = null;
  message = '';

  constructor(private targetService: BranchDailyTargetSeasonService) {}

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

const dto: BranchDailyTargetSeasonExcelUploadDto = {
  rows: rows.map(r => {

    const excelDate = XLSX.SSF.parse_date_code(r['TargetDate']);

    const targetDate =
      `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;

    return {
      branchNumber: Number(r['BranchNumber']),
      targetDate: targetDate,
      dailyTargetAmount: Number(r['DailyTargetAmount']),
      achievedAmount: Number(r['AchievedAmount'] ?? 0),
      achievedPercentage: Number(r['AchievedPercentage'] ?? 0),
      notes: r['Notes'] ?? ''
    };
  })
};
console.log(JSON.stringify(dto, null, 2));
// اطبع البيانات قبل إرسالها

      this.targetService.uploadExcel(dto).subscribe({
        next: () => {
         
          this.message = 'تم رفع ملف التارجت بنجاح ✔';
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
