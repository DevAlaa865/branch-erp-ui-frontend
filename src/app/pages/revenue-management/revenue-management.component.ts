import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-revenue-management',
  standalone: true,
  imports: [RouterLink,RouterOutlet,HasPermissionDirective],
  templateUrl: './revenue-management.component.html',
  styleUrl: './revenue-management.component.css'
})
export class RevenueManagementComponent {

}
