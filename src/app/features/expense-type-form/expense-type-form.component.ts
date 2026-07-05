import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseTypeService } from '../../services/Expenses/expense-type.service';
import { ExpenseType } from '../../shared/models/expense-type.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-expense-type-form',
  imports:[CommonModule,FormsModule],
  standalone: true,
  templateUrl: './expense-type-form.component.html',
})
export class ExpenseTypeFormComponent implements OnInit {

  model: ExpenseType = {
    id: 0,
    name: '',
    description: '',
    isActive: true,
    category: 1
  };

  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ExpenseTypeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isEdit = true;
      this.service.getById(id).subscribe(res => this.model = res);
    }
  }

  save() {
    if (this.isEdit) {
      this.service.update(this.model).subscribe(() => {
        this.router.navigate(['cash-management/expenses/expense-type']);
      });
    } else {
      this.service.create(this.model).subscribe(() => {
        this.router.navigate(['cash-management/expenses/expense-type']);
      });
    }
  }
}
