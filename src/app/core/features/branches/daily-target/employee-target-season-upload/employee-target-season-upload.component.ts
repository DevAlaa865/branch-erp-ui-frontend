import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

import { EmployeeShiftTargetSeasonHeaderService } from '../../../../../services/employee-shift-target-season-header.service';
import { EmployeeShiftTargetSeasonExcelUploadDto } from '../../../../../shared/models/employee-target-season.models';

@Component({
  selector: 'app-employee-target-season-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './employee-target-season-upload.component.html',
  styleUrls: ['./employee-target-season-upload.component.css']
})
export class EmployeeTargetSeasonUploadComponent {

  form!: FormGroup;
  selectedFile: File | null = null;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private headerService: EmployeeShiftTargetSeasonHeaderService
  ) {
    this.form = this.fb.group({
      shiftType: [null, Validators.required]
    });
  }

 excelDateToJSDate(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30);
  // ✅ أضف +1 لتصحيح فرق اليوم
  const jsDate = new Date(excelEpoch.getTime() + (serial + 1) * 86400000);
  return jsDate.toISOString().split('T')[0];
}


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  upload() {
    if (!this.selectedFile) {
      this.message = 'من فضلك اختر ملف الإكسل أولاً';
      return;
    }

    if (this.form.invalid) {
      this.message = 'من فضلك اختر نوع الشيفت';
      return;
    }

    const { shiftType } = this.form.value;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const dto: EmployeeShiftTargetSeasonExcelUploadDto = {
        rows: rows.map((r: any) => ({
          branchNumber: Number(r.BranchNumber),
          targetDate: this.excelDateToJSDate(r.TargetDate),
          totalShiftTargetAmount: Number(r.TotalShiftTargetAmount),
          employeesCount: Number(r.EmployeesCount),
          shiftType: Number(shiftType)
        }))
      };

      this.headerService.uploadExcel(dto).subscribe({
        next: () => {
          this.message = '✔ تم رفع ملف تارجت الموظفات بنجاح';
        },
        error: () => {
          this.message = '❌ حدث خطأ أثناء رفع الملف';
        }
      });
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }
}
