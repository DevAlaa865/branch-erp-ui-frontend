import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // لو اليوزر مش عامل Login → رجّعه للّوجين
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // غير كده → اسمح له يدخل /admin
  return true;
};
