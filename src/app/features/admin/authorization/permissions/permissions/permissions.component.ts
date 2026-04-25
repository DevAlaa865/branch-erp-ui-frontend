import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Permission, PermissionService } from '../../../../../services/permission.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.component.html'
})
export class PermissionsComponent implements OnInit {

  permissions: Permission[] = [];

  form = {
    id: 0,
    name: '',
    code: ''
  };

  isEditing = false;
  isLoading = false;
  error = '';
  message = '';

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions() {
    this.isLoading = true;
    this.error = '';
    this.permissionService.getAll().subscribe({
      next: res => {
        this.permissions = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'خطأ في تحميل الصلاحيات';
        this.isLoading = false;
      }
    });
  }

  startCreate() {
    this.isEditing = false;
    this.message = '';
    this.form = { id: 0, name: '', code: '' };
  }

  startEdit(p: Permission) {
    this.isEditing = true;
    this.message = '';
    this.form = { id: p.id, name: p.name, code: p.code };
  }

  save() {
    if (!this.form.name || !this.form.code) return;

    this.message = '';
    this.error = '';

    if (this.isEditing) {
      this.permissionService.update(this.form.id, {
        name: this.form.name,
        code: this.form.code
      }).subscribe({
        next: () => {
          this.message = 'تم تعديل الصلاحية بنجاح';
          this.loadPermissions();
        },
        error: () => {
          this.error = 'حدث خطأ أثناء تعديل الصلاحية';
        }
      });
    } else {
      this.permissionService.create({
        name: this.form.name,
        code: this.form.code
      }).subscribe({
        next: () => {
          this.message = 'تم إضافة الصلاحية بنجاح';
          this.loadPermissions();
          this.startCreate();
        },
        error: () => {
          this.error = 'حدث خطأ أثناء إضافة الصلاحية (ربما الكود مكرر)';
        }
      });
    }
  }

  delete(p: Permission) {
    if (!confirm(`حذف الصلاحية: ${p.name} ؟`)) return;

    this.message = '';
    this.error = '';

    this.permissionService.delete(p.id).subscribe({
      next: () => {
        this.message = 'تم حذف الصلاحية بنجاح';
        this.loadPermissions();
      },
      error: () => {
        this.error = 'حدث خطأ أثناء حذف الصلاحية';
      }
    });
  }
}
