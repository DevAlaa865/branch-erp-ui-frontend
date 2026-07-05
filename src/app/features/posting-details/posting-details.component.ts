import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostingDetails } from '../../shared/models/posting-details.model';
import { CashPostingService } from '../../services/Expenses/cash-posting.service';


@Component({
  selector: 'app-posting-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posting-details.component.html',
  styleUrls: ['./posting-details.component.css']
})
export class PostingDetailsComponent implements OnInit {

  details!: PostingDetails;

  constructor(
    private route: ActivatedRoute,
    private service: CashPostingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getPostingDetails(id).subscribe(res => {
      this.details = res;
    });
  }
}
