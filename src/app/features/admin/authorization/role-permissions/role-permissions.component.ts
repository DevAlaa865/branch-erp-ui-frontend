import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthorizationAdminService } from '../../../../services/authorization-admin.service';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.css'
})
export class RolePermissionsComponent implements OnInit {

  roles: any[] = [];
  permissions: any[] = [];

  selectedRoleId: string = '';
  selectedPermissionIds: number[] = [];

  isLoading = false;
  isSaving = false;
  saveMessage = '';

  // أسماء الأدوار بالعربي
  roleLabels: Record<string, string> = {
    'Finance': 'المالية',
    'Discounts': 'الخصومات',
    'Sales': 'المبيعات',
    'GeneralManagement': 'الإدارة العامة',
    'Returns': 'المرتجعات',
    'IT': 'تقنية المعلومات',
    'Accounts': 'الحسابات',
    'Development': 'التطوير',
    'Admin': 'المدير العام',
    'BranchManagement': 'إدارة الفروع'
  };

  // أسماء الصلاحيات بالعربي
  permissionLabels: Record<string, string> = {
    'SalesJournal.View': 'عرض يومية المبيعات',
    'SalesJournal.Edit': 'تعديل يومية المبيعات',
    'SalesJournal.Approve': 'اعتماد يومية المبيعات',
    'Branch.View': 'عرض الفروع',
    'Branch.Edit': 'تعديل بيانات الفروع',
    // زوّد هنا باقي الأكواد حسب ما عندك في الداتا
  };

  constructor(private authAdminService: AuthorizationAdminService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.authAdminService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.data || [];
      }
    });
  }

  loadPermissions() {
    this.authAdminService.getAllPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res.data || [];
      }
    });
  }

  onRoleChange() {
    if (!this.selectedRoleId) {
      this.selectedPermissionIds = [];
      return;
    }

    this.isLoading = true;
    this.selectedPermissionIds = [];

    this.authAdminService.getRolePermissions(this.selectedRoleId).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.data && Array.isArray(res.data.permissions)) {
          this.selectedPermissionIds = res.data.permissions.map((p: any) => p.id);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  isPermissionChecked(permissionId: number): boolean {
    return this.selectedPermissionIds.includes(permissionId);
  }

  togglePermission(permissionId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedPermissionIds.includes(permissionId)) {
        this.selectedPermissionIds.push(permissionId);
      }
    } else {
      this.selectedPermissionIds =
        this.selectedPermissionIds.filter(id => id !== permissionId);
    }
  }

  save() {
    if (!this.selectedRoleId) return;

    this.isSaving = true;
    this.saveMessage = '';

    this.authAdminService.updateRolePermissions({
      roleId: this.selectedRoleId,
      permissionIds: this.selectedPermissionIds
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveMessage = 'تم حفظ صلاحيات الدور بنجاح';
      },
      error: () => {
        this.isSaving = false;
        this.saveMessage = 'حدث خطأ أثناء حفظ الصلاحيات';
      }
    });
  }
}
