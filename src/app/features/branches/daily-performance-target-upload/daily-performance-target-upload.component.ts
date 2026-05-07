import { Component } from '@angular/core';
import { BranchDailyPerformanceTargetService } from '../../../services/branch-daily-performance-target.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-performance-target-upload',
  standalone:true,
    imports: [CommonModule],
  templateUrl: './daily-performance-target-upload.component.html',
  styleUrls: ['./daily-performance-target-upload.component.css']
})
export class DailyPerformanceTargetUploadComponent {

  selectedFile: File | null = null;
  isUploading = false;
  message = '';
  isSuccess: boolean | null = null;

  constructor(
    private targetService: BranchDailyPerformanceTargetService
  ) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }
    this.selectedFile = input.files[0];
    this.message = '';
    this.isSuccess = null;
  }

  upload() {
    if (!this.selectedFile) {
      this.message = 'من فضلك اختر ملف إكسل أولاً';
      this.isSuccess = false;
      return;
    }

    this.isUploading = true;
    this.message = '';

    this.targetService.uploadExcel(this.selectedFile).subscribe({
      next: (res:any) => {
        this.isUploading = false;
        this.isSuccess = res.success;
        this.message = res.message || 'تم رفع الملف ومعالجة التارجت بنجاح';
      },
      error: () => {
        this.isUploading = false;
        this.isSuccess = false;
        this.message = 'حدث خطأ أثناء رفع الملف';
      }
    });
  }
}
