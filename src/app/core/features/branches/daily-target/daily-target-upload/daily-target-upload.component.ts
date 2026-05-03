import { Component } from '@angular/core';
import { BranchDailyTargetService } from '../../../../../services/branch-daily-target.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-target-upload',
  standalone:true,
   imports: [CommonModule],   // ← أهم سطر
  templateUrl: './daily-target-upload.component.html',
  styleUrls: ['./daily-target-upload.component.css']
})
export class DailyTargetUploadComponent {

  selectedFile: File | null = null;
  message = '';

  constructor(private targetService: BranchDailyTargetService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  upload() {
    if (!this.selectedFile) {
      this.message = 'من فضلك اختر ملف أولاً';
      return;
    }

    this.targetService.importExcel(this.selectedFile).subscribe({
      next: () => {
        this.message = 'تم رفع ملف التارجت بنجاح ✔';
        this.selectedFile = null;
      },
      error: (err) => {
        console.error(err);
        this.message = 'حدث خطأ أثناء رفع الملف ❌';
      }
    });
  }
}
