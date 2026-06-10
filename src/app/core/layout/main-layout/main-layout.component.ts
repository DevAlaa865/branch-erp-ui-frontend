import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
export class MainLayoutComponent  {

  userName: string | null = null;
  branchName: string | null = null;
  roles: string[] = [];
  currentYear = new Date().getFullYear();

  isSidebarOpen = false;
  isMobile = false;

  constructor(public auth: AuthService, private router: Router) {}

ngOnInit() {
     this.userName = this.auth.getUserName();
     
const rawBranch = this.auth.getBranchName();
this.branchName = rawBranch ? this.fixArabic(rawBranch) : null;

    this.roles = this.auth.getRoles();

  this.isMobile = window.innerWidth < 768;

  if (!this.isMobile) {
    this.isSidebarOpen = true;
  }
}
fixArabic(text: string) {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

  // Sidebar Toggle
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  // Detect screen resize
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;

    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
  }

  // Theme Toggle
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

  decodeArabic(text: string) {
    return decodeURIComponent(escape(text));
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
