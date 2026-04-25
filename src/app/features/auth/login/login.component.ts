import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
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
     next: () => {
  this.isLoading = false;

        const perms = this.auth.getPermissions();

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
}
