import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthorizationAdminService } from '../../../../../services/authorization-admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {

  users: any[] = [];
  roles: any[] = [];

  // 🔥 جديد: الفروع
  branches: any[] = [];

  currentPage: number = 1;
  pageSize: number = 10;

  selectedUser: any = null;
  selectedRoleNames: string[] = [];

  isLoadingRoles = false;
  isSaving = false;
  saveMessage = '';

  editUser: any = null;

  // ✅ عدّلنا الموديل هنا وأضفنا userName + branchId
  editModel: any = {
    displayName: '',
    email: '',
    isActive: true,
    userType: 0,
    branchId: null,
    userName: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  isSavingUser = false;
  editMessage = '';

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

  constructor(private authAdminService: AuthorizationAdminService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadBranches();   // 🔥 إضافة تحميل الفروع
  }

  loadUsers() {
    this.authAdminService.getUsers().subscribe({
      next: res => this.users = res.data || []
    });
  }

  loadRoles() {
    this.authAdminService.getRoles().subscribe({
      next: res => this.roles = res.data
    });
  }

  // 🔥 دالة تحميل الفروع
  loadBranches() {
    this.authAdminService.getBranches().subscribe({
      next: res => this.branches = res.data || []
    });
  }

  mapUserType(type: number): string {
    switch (type) {
      case 1: return 'مستخدم فرع';
      case 2: return 'مدير مدينة';
      case 3: return 'مستخدم مركزي';
      default: return 'غير محدد';
    }
  }

  openUserRoles(user: any) {
    this.selectedUser = user;
    this.saveMessage = '';
    this.selectedRoleNames = [];
    this.isLoadingRoles = true;

    this.authAdminService.getUserRoles(user.id).subscribe({
      next: res => {
        this.isLoadingRoles = false;
        this.selectedRoleNames = res.data || [];
      },
      error: _ => this.isLoadingRoles = false
    });
  }

  isRoleChecked(roleName: string): boolean {
    return this.selectedRoleNames.includes(roleName);
  }

  toggleRole(roleName: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedRoleNames.includes(roleName)) {
        this.selectedRoleNames.push(roleName);
      }
    } else {
      this.selectedRoleNames = this.selectedRoleNames.filter(r => r !== roleName);
    }
  }

  saveUserRoles() {
    if (!this.selectedUser) return;

    this.isSaving = true;
    this.saveMessage = '';

    this.authAdminService.updateUserRoles({
      userId: this.selectedUser.id,
      roleNames: this.selectedRoleNames
    }).subscribe({
      next: res => {
        this.isSaving = false;
        this.saveMessage = 'تم حفظ أدوار المستخدم بنجاح';
      },
      error: _ => {
        this.isSaving = false;
        this.saveMessage = 'حدث خطأ أثناء حفظ الأدوار';
      }
    });
  }

  closePanel() {
    this.selectedUser = null;
    this.selectedRoleNames = [];
    this.saveMessage = '';
  }

  // ✅ هنا أضفنا userName + branchId في الموديل
  openUserEdit(user: any) {
    this.editUser = user;
    this.editMessage = '';

    this.editModel = {
      displayName: user.displayName,
      email: user.email,
      isActive: user.isActive,
      userType: user.userType,
      branchId: user.branchId ?? null,
      userName: user.userName,
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  closeEditPanel() {
    this.editUser = null;
    this.editMessage = '';
  }

  saveUserData() {
    if (!this.editUser) return;

    this.editMessage = '';

    if (this.editModel.newPassword) {
      if (this.editModel.newPassword !== this.editModel.confirmNewPassword) {
        this.editMessage = 'كلمتا المرور الجديدة غير متطابقتين';
        return;
      }
    }

    this.isSavingUser = true;

    // ✅ هنا أرسلنا userName + branchId مع باقي البيانات
    this.authAdminService.updateUserData({
      id: this.editUser.id,
      displayName: this.editModel.displayName,
      email: this.editModel.email,
      isActive: this.editModel.isActive,
      userType: this.editModel.userType,
      branchId: this.editModel.branchId,
      userName: this.editModel.userName
    }).subscribe({
      next: res => {

        this.editUser.displayName = this.editModel.displayName;
        this.editUser.email = this.editModel.email;
        this.editUser.isActive = this.editModel.isActive;
        this.editUser.userType = this.editModel.userType;
        this.editUser.branchId = this.editModel.branchId;
        this.editUser.userName = this.editModel.userName;

        const index = this.users.findIndex(u => u.id === this.editUser.id);
        if (index !== -1) this.users[index] = { ...this.editUser };

        if (this.editModel.newPassword) {
          this.authAdminService.adminResetPassword({
            userId: this.editUser.id,
            newPassword: this.editModel.newPassword
          }).subscribe({
            next: _ => {
              this.isSavingUser = false;
              this.editMessage = 'تم حفظ البيانات وتغيير كلمة المرور بنجاح';
              this.editModel.newPassword = '';
              this.editModel.confirmNewPassword = '';
            },
            error: _ => {
              this.isSavingUser = false;
              this.editMessage = 'تم حفظ البيانات لكن حدث خطأ أثناء تغيير كلمة المرور';
            }
          });
        } else {
          this.isSavingUser = false;
          this.editMessage = 'تم حفظ بيانات المستخدم بنجاح';
        }
      },
      error: _ => {
        this.isSavingUser = false;
        this.editMessage = 'حدث خطأ أثناء حفظ البيانات';
      }
    });
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.users.length / this.pageSize));
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
}
