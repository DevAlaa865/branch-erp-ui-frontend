import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
   styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.form.value).subscribe({
     next: (res) => {
/*          console.log('LOGIN RESPONSE', res);

      console.log('TOKEN', localStorage.getItem('token')); */

      const perms = this.auth.getPermissions();
     

      // 🔥 هنا الشرط الجديد
      const isExpired = this.checkExpiry();

      // لو منتهي وأيضًا المستخدم مش Admin → امنعه
      if (isExpired && !perms.includes('Permissions.Manage')) {
        this.errorMessage = 'لا يمكن تشغيل البرنامج — انتهت مدة التجربة';
        return;
      }
   
      
     /*  console.log('PERMISSIONS', perms); */
  this.isLoading = false;


        if (perms.includes('Admin.Access')) {
          this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'بيانات الدخول غير صحيحة';
      }
    });
  }

  isPasswordVisible = false;
loginError: string | null = null;

togglePasswordVisibility() {
  this.isPasswordVisible = !this.isPasswordVisible;
}
checkExpiry(): boolean {
  const expiry = localStorage.getItem('expiryDate');

  // لو مفيش تاريخ أصلاً → اعتبر البرنامج شغال
  if (!expiry) return false;

  const expiryDate = new Date(expiry);
  const today = new Date();

  // لو اليوم أكبر من تاريخ الانتهاء → منتهي
  return today > expiryDate;
}
}
