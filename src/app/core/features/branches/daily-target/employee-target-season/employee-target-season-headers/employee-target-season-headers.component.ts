import { Component, OnInit } from '@angular/core';
import { EmployeeShiftTargetSeasonHeaderService } from '../../../../../../services/employee-shift-target-season-header.service';
import { EmployeeShiftTargetSeasonHeader } from '../../../../../../shared/models/employee-target-season.models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-target-season-headers',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './employee-target-season-headers.component.html',
  styleUrls: ['./employee-target-season-headers.component.css']
})
export class EmployeeTargetSeasonHeadersComponent implements OnInit {

  headers: EmployeeShiftTargetSeasonHeader[] = [];
  branchId: number | null = null;
  date: string | null = null;
  shiftType: number | null = null;

  constructor(
    private headerService: EmployeeShiftTargetSeasonHeaderService
  ) {}

  ngOnInit(): void {
    this.loadHeaders();
  }

loadHeaders() {
  this.headerService.getHeaders().subscribe({
    next: (res) => this.headers = res,
    error: (err) => console.error(err)
  });
}

}
