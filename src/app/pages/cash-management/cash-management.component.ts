import { Component } from '@angular/core';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cash-management',
  standalone: true,
  imports: [CommonModule, RouterModule,RouterOutlet],
  templateUrl: './cash-management.component.html',
  styleUrl: './cash-management.component.css'
})
export class CashManagementComponent {

}
