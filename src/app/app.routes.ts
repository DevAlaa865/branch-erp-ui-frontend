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
          path: 'revenue-management',
          loadComponent: () =>
            import('./pages/revenue-management/revenue-management.component')
              .then(m => m.RevenueManagementComponent)
        },
        {
          path: 'revenue-management/branch-daily-difference-report',
          loadComponent: () =>
            import('./features/reports/branch-daily-difference-report/branch-daily-difference-report.component')
              .then(m => m.BranchDailyDifferenceReportComponent)
        },
        {
          path: 'revenue-management/branch-sales-daily-list',
          loadComponent: () =>
            import('./features/branches/branch-sales-daily-list/branch-sales-daily-list.component')
              .then(m => m.BranchSalesDailyListComponent)
        },

        {
        path: 'revenue-management/branch-daily-summary',
        loadComponent: () =>
        import('./features/reports/branch-daily-summary-report/branch-daily-summary-report.component')
         .then(m => m.BranchDailySummaryReportComponent)
       },
       {
        path: 'revenue-management/accounts-returns-discounts-report',
        loadComponent: () =>
          import('./features/reports/accounts-returns-discounts-report/accounts-returns-discounts-report.component')
            .then(m => m.AccountsReturnsDiscountsReportComponent)
      },
        {
          path: 'revenue-management/account-control-issues-report',
          loadComponent: () =>
            import('./features/branches/account-control-issues-report/account-control-issues-report.component')
              .then(m => m.AccountControlIssuesReportComponent )
        },
        {
        path: 'revenue-management/daily-sales-inquiry',
        
        loadComponent: () =>
          import('./features/reports/daily-sales-inquiry/daily-sales-inquiry.component')
            .then(m => m.DailySalesInquiryComponent)
        },
        {
          path: 'revenue-management/sales-summary-report-filters',
          loadComponent: () =>
            import('./features/reports/sales-summary-report/filters/filters.component')
              .then(m => m.FiltersComponent)
        },
          {
            path: 'reports/sales-summary-report-result',
            loadComponent: () =>
              import('./features/reports/sales-summary-report/result/result.component')
                .then(m => m.ResultComponent)
          },

        {
        path: 'returns-management',
        loadComponent: () =>
          import('./pages/returns-management/returns-management.component')
            .then(m => m.ReturnsManagementComponent)
       },
       {
        path: 'returns-management/returns-discounts-management',
        loadComponent: () =>
          import('./features/reports/returns-discounts-management/returns-discounts-management.component')
            .then(m => m.ReturnsDiscountsManagementComponent)
      },
       {
        path: 'returns-management/returns-upload',
        loadComponent: () =>
          import('./pages/returns-upload/returns-upload.component')
            .then(m => m.ReturnsUploadComponent)
        },
        {
        path: 'returns-management/daily-returns',
        loadComponent: () =>
          import('./features/branches/daily-returns/daily-returns.component')
            .then(m => m.DailyReturnsComponent)
        },
        {
          path: 'control-management',
          loadComponent: () =>
            import('./pages/control-management/control-management.component')
              .then(m => m.ControlManagementComponent)
        },

        {
          path: 'control-management/branch-control-issues',
          loadComponent: () =>
            import('./features/branches/branch-control-issues/branch-control-issues.component')
              .then(m => m.BranchControlIssuesComponent)
        },
        {
          path: 'control-management/branch-control-manager-report',
          loadComponent: () =>
            import('./features/branches/branch-control-manager-report/branch-control-manager-report.component')
              .then(m => m.BranchControlManagerReportComponent)
        },
         {
          path: 'control-management/account-control-issues-report',
          loadComponent: () =>
            import('./features/branches/account-control-issues-report/account-control-issues-report.component')
              .then(m => m.AccountControlIssuesReportComponent )
        }, 
        {
        path: 'general-management',
        loadComponent: () =>
          import('./pages/general-management/general-management.component')
            .then(m => m.GeneralManagementComponent)
        },

        {
            path: 'general-management/users',
            loadComponent: () =>
              import('./features/admin/users/list/users-list/users-list.component')
                .then(m => m.UsersListComponent)
         },
         {
            path: 'general-management/countries',
            canActivate: [permissionGuard('Countries.View')],
            loadComponent: () =>
              import('./features/admin/master-data/countries/countries.component')
                .then(m => m.CountriesComponent)
          },
          {
             path: 'general-management/areas',
             loadComponent: () =>
             import('./features/admin/master-data/area/areas/areas.component')
             .then(m => m.AreasComponent)
           },
           {
            path: 'general-management/cities',
            loadComponent: () =>
              import('./features/admin/master-data/city/cities/cities.component')
                .then(m => m.CitiesComponent)
          }, 
            {
            path: 'general-management/activity-types',
            loadComponent: () =>
              import('./features/admin/master-data/activity-type/activity-types/activity-types.component')
                .then(m => m.ActivityTypesComponent)
          },

          {
            path: 'general-management/shortage-types',
            loadComponent: () =>
              import('./features/admin/master-data/shortage-type/shortage-types/shortage-types.component')
                .then(m => m.ShortageTypesComponent)
          },

          {
            path: 'general-management/employees',
            loadComponent: () =>
              import('./features/admin/master-data/employee/employees/employees.component')
                .then(m => m.EmployeesComponent)
          },

          {
            path: 'general-management/branch',
            loadComponent: () =>
              import('./features/admin/master-data/branch/branch/branch.component')
                .then(m => m.BranchComponent)
          },

           {
            path: 'general-management/role-permissions',
            loadComponent: () =>
              import('./features/admin/authorization/role-permissions/role-permissions.component')
                .then(m => m.RolePermissionsComponent)
          },
          /////
     /*  {
      path: 'reports/branch-daily-summary',
      loadComponent: () =>
        import('./features/reports/branch-daily-summary-report/branch-daily-summary-report.component')
          .then(m => m.BranchDailySummaryReportComponent)
      }, */
       {
        path: 'reports/branch-daily-summary/result',
          loadComponent: () =>
            import('./features/reports/branch-daily-summary-result/branch-daily-summary-result.component')
              .then(m => m.BranchDailySummaryResultComponent)
      },
            
/*       {
        path: 'reports/returns-discounts-management',
        loadComponent: () =>
          import('./features/reports/returns-discounts-management/returns-discounts-management.component')
            .then(m => m.ReturnsDiscountsManagementComponent)
      }, */
      ////
      {
        path: 'reports/city-branch-sales-summary',
          loadComponent: () =>
            import('./features/reports/city-branch-sales-summary/city-branch-sales-summary.component')
              .then(m => m.CityBranchSalesSummaryComponent)
      },
        {
          path: 'reports/city-branch-sales-summary/result',
          loadComponent: () =>
            import('./features/reports/city-branch-sales-summary-result/city-branch-sales-summary-result.component')
              .then(m => m.CityBranchSalesSummaryResultComponent)
        },
        {
        path: 'reports/city-branch-sales-summary-chart',
        loadComponent: () =>
          import('./features/reports/city-branch-sales-summary-chart/city-branch-sales-summary-chart.component')
            .then(m => m.CityBranchSalesSummaryChartComponent)
      },
      {
      path: 'reports/branch-network-shortage',
      loadComponent: () =>
        import('./features/reports/branch-network-shortage/branch-network-shortage.component')
          .then(m => m.BranchNetworkShortageComponent)
       },
       {
          path: 'branches/performance-dashboard',
          loadComponent: () =>
            import('./features/branches/performance-dashboard/performance-dashboard.component')
              .then(m => m.PerformanceDashboardComponent)
        },
        {
          path: 'reports/branch-daily-performance',
          loadComponent: () =>
            import('./features/reports/branch-daily-performance-report/branch-daily-performance-report.component')
              .then(m => m.BranchDailyPerformanceReportComponent)
        },
        {
          path: 'commission-rules',
          loadComponent: () =>
            import('./pages/commission-rules/commission-rules.component')
              .then(m => m.CommissionRulesComponent)
        },

        {
          path: 'branch-performance-chart',
          loadComponent: () =>
            import('./features/reports/branch-performance-chart/branch-performance-chart.component')
              .then(m => m.BranchPerformanceChartComponent)
        },
       /*  {
        path: 'returns-upload',
        loadComponent: () =>
          import('./pages/returns-upload/returns-upload.component')
            .then(m => m.ReturnsUploadComponent)
        }, */
    /*    {
          path: 'daily-returns',
          loadComponent: () =>
            import('./features/branches/daily-returns/daily-returns.component')
              .then(m => m.DailyReturnsComponent)
        }, */
        {
          path: 'branches/daily-returns-chart',
          loadComponent: () =>
            import('./features/branches/daily-returns/daily-returns-chart/daily-returns-chart.component')
              .then(m => m.DailyReturnsChartComponent)
        },
       /*  {
          path: 'branches/branch-sales-daily-list',
          loadComponent: () =>
            import('./features/branches/branch-sales-daily-list/branch-sales-daily-list.component')
              .then(m => m.BranchSalesDailyListComponent)
        }, */
        /* {
        path: 'reports/branch-daily-difference-report',
        loadComponent: () =>
          import('./features/reports/branch-daily-difference-report/branch-daily-difference-report.component')
            .then(m => m.BranchDailyDifferenceReportComponent)
       }, */
      /*  {
        path: 'branches/branch-control-issues',
        loadComponent: () =>
          import('./features/branches/branch-control-issues/branch-control-issues.component')
            .then(m => m.BranchControlIssuesComponent)
      }, */
     /*  {
        path: 'branches/branch-control-manager-report',
        loadComponent: () =>
          import('./features/branches/branch-control-manager-report/branch-control-manager-report.component')
            .then(m => m.BranchControlManagerReportComponent)
      }, */
     /*  {
        path: 'control-management',
        loadComponent: () =>
          import('./pages/control-management/control-management.component')
            .then(m => m.ControlManagementComponent)
      },

      {
        path: 'control-management/control-issues',
        loadComponent: () =>
          import('./features/branches/branch-control-issues/branch-control-issues.component')
            .then(m => m.BranchControlIssuesComponent)
      }, */
    /*   {
          path: 'branches/account-control-issues-report',
          loadComponent: () =>
            import('./features/branches/account-control-issues-report/account-control-issues-report.component')
              .then(m => m.AccountControlIssuesReportComponent )
        }, */
      /*   {
        path: 'reports/accounts-returns-discounts-report',
        loadComponent: () =>
          import('./features/reports/accounts-returns-discounts-report/accounts-returns-discounts-report.component')
            .then(m => m.AccountsReturnsDiscountsReportComponent)
      },
 */
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
        path: 'branches/daily-target',
        loadComponent: () =>
          import('./features/branches/daily-target/daily-target.component')
            .then(m => m.DailyTargetComponent)
      },
      {
        path: 'branches/daily-sales/:branchId/:date',
      
        loadComponent: () =>
          import('./features/branches/daily-sales/daily-sales.component')
            .then(m => m.DailySalesComponent)
      },
    /*   {
        path: 'reports/daily-sales-inquiry',
        
        loadComponent: () =>
          import('./features/reports/daily-sales-inquiry/daily-sales-inquiry.component')
            .then(m => m.DailySalesInquiryComponent)
        }, */
        {
        path: 'branches/daily-target-upload',
        loadComponent: () =>
          import('./core/features/branches/daily-target/daily-target-upload/daily-target-upload.component')
            .then(m => m.DailyTargetUploadComponent)
      },
      {
      path: 'branch-targets',
      loadComponent: () =>
        import('./features/branches/daily-target/branch-target-list/branch-target-list.component')
          .then(m => m.BranchTargetListComponent)
    },
    {
        path: 'branches/target-chart',
        loadComponent: () =>
          import('./features/branches/target-chart/target-chart.component')
            .then(m => m.TargetChartComponent)
      },
    {
      path: 'employees/targets',
      loadComponent: () =>
        import('./features/branches/employee-target-list/employee-target-list.component')
          .then(m => m.EmployeeTargetListComponent)
    },
    {
      path: 'employees/target-chart',
      loadComponent: () =>
        import('./features/branches/employee-target-chart/employee-target-chart.component')
          .then(m => m.EmployeeTargetChartComponent)
    },
    {
        path: 'reports/branch-period-report',
        loadComponent: () =>
          import('./features/reports/branch-period-report/branch-period-report.component')
            .then(m => m.BranchPeriodReportComponent)
      },
      {
        path: 'reports/branch-period-chart',
        loadComponent: () =>
          import('./features/reports/branch-period-chart/branch-period-chart.component')
            .then(m => m.BranchPeriodChartComponent)
      },
      {
      path: 'branches/daily-performance-target-upload',
      loadComponent: () =>
        import('./features/branches/daily-performance-target-upload/daily-performance-target-upload.component')
          .then(m => m.DailyPerformanceTargetUploadComponent)
      },
      {
        path: 'branches/daily-performance',
        loadComponent: () =>
          import('./features/branches/daily-performance/daily-performance.component')
            .then(m => m.DailyPerformanceComponent)
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

         /*  {
            path: 'role-permissions',
            loadComponent: () =>
              import('./features/admin/authorization/role-permissions/role-permissions.component')
                .then(m => m.RolePermissionsComponent)
          }, */

          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/admin/authorization/permissions/permissions/permissions.component')
                .then(m => m.PermissionsComponent)
          },

         /*  {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/list/users-list/users-list.component')
                .then(m => m.UsersListComponent)
          }, */

         /*  {
            path: 'countries',
            canActivate: [permissionGuard('Countries.View')],
            loadComponent: () =>
              import('./features/admin/master-data/countries/countries.component')
                .then(m => m.CountriesComponent)
          },
 */
     /*      {
            path: 'areas',
            loadComponent: () =>
              import('./features/admin/master-data/area/areas/areas.component')
                .then(m => m.AreasComponent)
          }, */
/* 
          {
            path: 'cities',
            loadComponent: () =>
              import('./features/admin/master-data/city/cities/cities.component')
                .then(m => m.CitiesComponent)
          }, */

        /*   {
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
          } */
        ]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
