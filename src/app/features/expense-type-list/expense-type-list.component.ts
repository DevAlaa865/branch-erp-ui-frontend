import { Component, OnInit } from '@angular/core';
;
import { Router } from '@angular/router';
import { ExpenseType } from '../../shared/models/expense-type.model';
import { ExpenseTypeService } from '../../services/Expenses/expense-type.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-type-list',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './expense-type-list.component.html',
})
export class ExpenseTypeListComponent implements OnInit {

  items: ExpenseType[] = [];
  loading = false;

  constructor(
    private service: ExpenseTypeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => {
        this.items = res;
        this.loading = false;
      },
      error: _ => this.loading = false
    });
  }

  goCreate() {
    this.router.navigate(['cash-management/expenses/expense-type/create']);
  }

  goEdit(id: number) {
    this.router.navigate(['cash-management/expenses/expense-type/edit', id]);
  }

  activate(id: number) {
    this.service.activate(id).subscribe(() => this.loadData());
  }

  deactivate(id: number) {
    this.service.deactivate(id).subscribe(() => this.loadData());
  }

  categoryName(cat: number): string {
  const map: Record<number, string> = {
    1: 'مصروف عام',
    2: 'تشغيل',
    3: 'رواتب',
    4: 'مرتجعات',
    5: 'عهدة لموظف',
    6: 'مصروفات صاحب عهدة',
    7: 'تحويل بين مسؤولي الإيداع',
    8: 'تسوية'
  };
  return map[cat] ?? 'غير معروف';
}

}
