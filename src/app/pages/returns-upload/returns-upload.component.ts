import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api.config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-returns-upload',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './returns-upload.component.html',
  styleUrls: ['./returns-upload.component.css']
})
export class ReturnsUploadComponent {
  selectedFile: File | null = null;
  loading = false;
  message: string | null = null;
  error: string | null = null;

  // Endpoint النهائي
  private uploadUrl = `${API_BASE_URL}/BranchDailyReturns/upload-excel`;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    // Validation بسيط للامتداد
    const allowedExtensions = ['xlsx', 'xls'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      this.error = 'من فضلك اختر ملف إكسل بصيغة xlsx أو xls';
      this.message = null;
      this.selectedFile = null;
      return;
    }

    this.error = null;
    this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.error = 'من فضلك اختر ملف أولاً';
      this.message = null;
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.loading = true;
    this.message = null;
    this.error = null;

    this.http.post<any>(this.uploadUrl, formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res?.message || 'تم رفع ملف المرتجعات بنجاح';
        this.error = null;
        this.selectedFile = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'حدث خطأ أثناء رفع الملف';
        this.message = null;
      }
    });
  }
}
