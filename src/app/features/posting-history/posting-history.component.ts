import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PostingHistory } from '../../shared/models/posting-history.model';
import { CashPostingService } from '../../services/Expenses/cash-posting.service';
import { RouterLink } from '@angular/router';
;

@Component({
  selector: 'app-posting-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './posting-history.component.html',
  styleUrls: ['./posting-history.component.css']
})
export class PostingHistoryComponent implements OnInit {

  form!: FormGroup;
  history: PostingHistory[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: CashPostingService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadHistory();
  }

  private getToday(): string {
    return new Date().toLocaleDateString('en-CA');
  }

  buildForm() {
    this.form = this.fb.group({
      date: [this.getToday()]
    });
  }

  loadHistory() {
    this.loading = true;
    const date = this.form.value.date;

    this.service.getPostingHistory(date).subscribe(res => {
      this.history = res;
      this.loading = false;
    });
  }
}
