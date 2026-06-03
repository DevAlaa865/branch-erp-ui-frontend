import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-control-management',
  standalone: true,
  imports: [CommonModule, RouterModule,HasPermissionDirective],
  templateUrl: './control-management.component.html',
  styleUrls: ['./control-management.component.scss']
})
export class ControlManagementComponent {

}
