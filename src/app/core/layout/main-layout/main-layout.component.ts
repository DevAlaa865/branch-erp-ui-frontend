/* import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule,HasPermissionDirective],
    templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainLayoutComponent {
userName: string | null = null;
branchName: string | null = null;
roles: string[] = [];

constructor(private auth: AuthService ,private  router: Router) {}

ngOnInit() {
this.userName = this.auth.getUserName();
const rawBranch = this.auth.getBranchName();
this.branchName = rawBranch ? decodeURIComponent(escape(rawBranch)) : null;

  this.roles = this.auth.getRoles(); // خليه زي ما هو
}


   currentYear = new Date().getFullYear();
     
   isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
   closeSidebar() {
    this.isSidebarOpen = false;
  }
logout(){
    this.auth.logout();
  this.router.navigate(['/login']);
}
}
 */

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, HasPermissionDirective],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainLayoutComponent {

  userName: string | null = null;
  branchName: string | null = null;
  roles: string[] = [];
  currentYear = new Date().getFullYear();

  isSidebarOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.userName = this.auth.getUserName();
    const rawBranch = this.auth.getBranchName();
    this.branchName = rawBranch ? decodeURIComponent(escape(rawBranch)) : null;
    this.roles = this.auth.getRoles();

    // Apply saved theme
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);

    if (isDark) document.documentElement.classList.add('dark');
    this.updateThemeIcon(isDark);
  }

  // Sidebar
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  // Theme
  toggleTheme() {
    const root = document.documentElement;
    root.classList.toggle('dark');

    const isDark = root.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    this.updateThemeIcon(isDark);
  }

  updateThemeIcon(isDark: boolean) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.innerHTML = isDark
      ? '<iconify-icon icon="solar:sun-bold-duotone" width="22" class="text-[#FFC107]"></iconify-icon>'
      : '<iconify-icon icon="solar:moon-bold-duotone" width="22" class="text-[var(--text-main)]"></iconify-icon>';
  }

  // Navigation
  navigate(path: string) {
    this.router.navigate([path]);
    this.closeSidebar();
  }

  // Logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
