import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommissionRuleService } from '../../services/commission-rule.service';
import { CommissionRuleDto, CommissionRuleCreateUpdateDto, CommissionType } from '../../shared/models/commission-rule.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commission-rules',
  standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './commission-rules.component.html',
  styleUrls: ['./commission-rules.component.css']
})
export class CommissionRulesComponent implements OnInit {

  rules: CommissionRuleDto[] = [];
  form!: FormGroup;
  isEdit = false;
  editId: number | null = null;

  commissionTypes = [
    { value: CommissionType.Branch, label: 'فرع' },
    { value: CommissionType.Employee, label: 'موظف' }
  ];

  CommissionType = CommissionType;

  constructor(
    private fb: FormBuilder,
    private commissionRuleService: CommissionRuleService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadRules();
  }

  buildForm(): void {
    this.form = this.fb.group({
      minPercentage: [null, [Validators.required]],
      maxPercentage: [null],
      fixedBonusAmount: [null],
      type: [CommissionType.Branch, [Validators.required]],
      isActive: [true]
    });
  }

  loadRules(): void {
    this.commissionRuleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CommissionRuleCreateUpdateDto = this.form.value;
  console.log("🚀 DTO قبل الإرسال:", dto);   // 👈 هنا بالظبط
    if (this.isEdit && this.editId !== null) {
      this.commissionRuleService.update(this.editId, dto).subscribe({
        next: () => {
          this.resetForm();
          this.loadRules();
        }
        
      });
      console.log(this.form)
    } else {
      this.commissionRuleService.create(dto).subscribe({
        next: () => {
          this.resetForm();
          this.loadRules();
        }
      });
    }
  }

  onEdit(rule: CommissionRuleDto): void {
    this.isEdit = true;
    this.editId = rule.id;

    this.form.patchValue({
      minPercentage: rule.minPercentage,
      maxPercentage: rule.maxPercentage,
      fixedBonusAmount: rule.fixedBonusAmount,
      type: rule.type,
      isActive: rule.isActive
    });
  }

  onDelete(rule: CommissionRuleDto): void {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;

    this.commissionRuleService.delete(rule.id).subscribe({
      next: () => {
        this.loadRules();
      }
    });
  }

  resetForm(): void {
    this.isEdit = false;
    this.editId = null;
    this.form.reset({
      minPercentage: null,
      maxPercentage: null,
      fixedBonusAmount: null,
      type: CommissionType.Branch,
      isActive: true
    });
  }
}
