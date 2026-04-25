import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective,RouterModule],
  templateUrl: './admin-dashboard.component.html',
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    private router: Router,
    public  auth: AuthService
  ) {}

  ngOnInit(): void {
    const perms = this.auth.getPermissions();
    console.log('User permissions from token:', perms);
    console.log(this.auth.getRoles());
  }

  openUsers() {
    this.router.navigate(['/admin/users']);
  }

  openCountries() {
    this.router.navigate(['/admin/countries']);
  }

  opendailySales() {
    this.router.navigate(['/branches/daily-sales']);
  }

  openRoles() {
    this.router.navigate(['/admin/role-permissions']);
  }

  openBranches() {
    this.router.navigate(['/admin/branch']);
  }

queries() {
  
  this.router.navigate(['/reports/daily-sales-inquiry']);
}
openReports()
{
    this.router.navigate(['/reports/branch-daily-summary']);

}
  openAreas() {
    this.router.navigate(['/admin/areas']);
  }

  openEmployee() {
    this.router.navigate(['/admin/employees']);
  }

  openCities() {
    this.router.navigate(['/admin/cities']);
  }

  openShortage() {
    this.router.navigate(['/admin/shortage-types']);
  }

  openActivities() {
    this.router.navigate(['/admin/activity-types']);
  }
  decodeArabic(text: string) {
  return decodeURIComponent(escape(text));
}
}
