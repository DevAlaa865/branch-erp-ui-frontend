import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [

  // ============================
  // Login
  // ============================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },



  // ============================
  // Main Layout (Protected)
  // ============================
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
       
      {
      path: 'reports/branch-daily-summary',
      loadComponent: () =>
        import('./features/reports/branch-daily-summary-report/branch-daily-summary-report.component')
          .then(m => m.BranchDailySummaryReportComponent)
      },
       {
    path: 'reports/branch-daily-summary/result',
      loadComponent: () =>
        import('./features/reports/branch-daily-summary-result/branch-daily-summary-result.component')
          .then(m => m.BranchDailySummaryResultComponent)
  },
         
      {
        path: 'reports/returns-discounts-management',
        loadComponent: () =>
          import('./features/reports/returns-discounts-management/returns-discounts-management.component')
            .then(m => m.ReturnsDiscountsManagementComponent)
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },

      // ============================
      // Dashboard (صفحة الكروت)
      // ============================
     
      // ============================
      // Daily Sales
      // ============================
      {
        path: 'branches/daily-sales',
        canActivate: [permissionGuard('dashbord.dailysails')],
        loadComponent: () =>
          import('./features/branches/daily-sales/daily-sales.component')
            .then(m => m.DailySalesComponent)
      },
      {
        path: 'branches/daily-sales/:branchId/:date',
      
        loadComponent: () =>
          import('./features/branches/daily-sales/daily-sales.component')
            .then(m => m.DailySalesComponent)
      },
      {
        path: 'reports/daily-sales-inquiry',
        
        loadComponent: () =>
          import('./features/reports/daily-sales-inquiry/daily-sales-inquiry.component')
            .then(m => m.DailySalesInquiryComponent)
        },

      // ============================
      // Admin (Protected by AdminGuard)
      // ============================
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [

          {
            path: 'create-user',
            loadComponent: () =>
              import('./features/admin/users/create-user/create-user.component')
                .then(m => m.CreateUserComponent)
          },

          {
            path: 'role-permissions',
            loadComponent: () =>
              import('./features/admin/authorization/role-permissions/role-permissions.component')
                .then(m => m.RolePermissionsComponent)
          },

          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/admin/authorization/permissions/permissions/permissions.component')
                .then(m => m.PermissionsComponent)
          },

          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/list/users-list/users-list.component')
                .then(m => m.UsersListComponent)
          },

          {
            path: 'countries',
            canActivate: [permissionGuard('Countries.View')],
            loadComponent: () =>
              import('./features/admin/master-data/countries/countries.component')
                .then(m => m.CountriesComponent)
          },

          {
            path: 'areas',
            loadComponent: () =>
              import('./features/admin/master-data/area/areas/areas.component')
                .then(m => m.AreasComponent)
          },

          {
            path: 'cities',
            loadComponent: () =>
              import('./features/admin/master-data/city/cities/cities.component')
                .then(m => m.CitiesComponent)
          },

          {
            path: 'activity-types',
            loadComponent: () =>
              import('./features/admin/master-data/activity-type/activity-types/activity-types.component')
                .then(m => m.ActivityTypesComponent)
          },

          {
            path: 'shortage-types',
            loadComponent: () =>
              import('./features/admin/master-data/shortage-type/shortage-types/shortage-types.component')
                .then(m => m.ShortageTypesComponent)
          },

          {
            path: 'employees',
            loadComponent: () =>
              import('./features/admin/master-data/employee/employees/employees.component')
                .then(m => m.EmployeesComponent)
          },

          {
            path: 'branch',
            loadComponent: () =>
              import('./features/admin/master-data/branch/branch/branch.component')
                .then(m => m.BranchComponent)
          }
        ]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
