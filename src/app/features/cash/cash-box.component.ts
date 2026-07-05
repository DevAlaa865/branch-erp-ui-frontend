import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/custom-select/custom-select.component';
import { CashBoxService } from '../../services/Expenses/cash-box.service';

import { DepositCollectorService } from '../../services/Expenses/deposit-collector.service';
import { PettyHolderService } from '../../services/Expenses/petty-holder.service';
import { UserCashCityService } from '../../services/Expenses/user-cash-city.service';

@Component({
  selector: 'app-cash-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './cash-box.component.html',
  styleUrls: ['./cash-box.component.css']
})
export class CashBoxComponent implements OnInit {

  form!: FormGroup;

  cashBoxes: any[] = [];
  depositCollectors: any[] = [];
  pettyHolders: any[] = [];

  message = '';
  loading = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private service: CashBoxService,
    private userCashService: UserCashCityService,
    private depositCollectorService: DepositCollectorService,
    private pettyHolderService: PettyHolderService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCashBoxes();
    this.loadRoles(); 
  }

  buildForm() {
    this.form = this.fb.group({
      id: [0],
      name: [''],
      openingBalance: [0],
      depositCollectorId: [null],
      pettyHolderId: [null],
      isActive: [true]
    });
  }

  loadCashBoxes() {
    this.service.getAll().subscribe(res => {
      this.cashBoxes = res;
    });
  }

loadRoles() {
  this.depositCollectorService.getAll().subscribe(res => {
    this.depositCollectors = res.map((x: any) => ({
      id: x.id,
      displayName: x.userName
    }));
  });

  this.pettyHolderService.getAll().subscribe(res => {
    this.pettyHolders = res.map((x: any) => ({
      id: x.id,
      displayName: x.name
    }));
  });
}


  edit(box: any) {
    this.isEdit = true;
    this.form.patchValue(box);
  }

  save() {
    this.loading = true;
    this.message = '';

    const body = this.form.value;

    if (this.isEdit) {
      this.service.update(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم التعديل بنجاح';
          this.loadCashBoxes();
        }
      });
    } else {
      this.service.create(body).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'تم الإنشاء بنجاح';
          this.loadCashBoxes();
        }
      });
    }
  }

  toggleActive(box: any) {
    const newState = !box.isActive;
    this.service.setActive(box.id, newState).subscribe(() => {
      this.loadCashBoxes();
    });
  }
}
