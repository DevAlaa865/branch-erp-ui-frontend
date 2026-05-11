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
   styleUrl: './admin-dashboard.component.css',
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
  openReportOfSales()
  {
      this.router.navigate(['/reports/city-branch-sales-summary']);
    
  }
  openRoles() {
    this.router.navigate(['/admin/role-permissions']);
  }

  openBranches() {
    this.router.navigate(['/admin/branch']);
  }
    openSalesOfTarget()
    {
            this.router.navigate(['/branches/daily-target']);
    }
queries() {
  
  this.router.navigate(['/reports/daily-sales-inquiry']);
}
openReports()
{
    this.router.navigate(['/reports/branch-daily-summary']);

}
/* opendailyBranchTarget()
{
   this.router.navigate(['/branches/daily-performance']);
} */
opendailyTarget()
{
   this.router.navigate(['/branches/performance-dashboard']);
}
opendailyTargetReport()
{
   this.router.navigate(['/reports/branch-daily-performance']);
}
openCommesionRecording()
{
    this.router.navigate(['/commission-rules']);
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
