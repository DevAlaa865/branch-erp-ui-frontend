import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasPermission(permission)) {
      return true;
    }

    router.navigate(['dashboard']);
    return false;
  };
};
