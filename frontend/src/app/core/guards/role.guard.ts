import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (user.role === 'admin' || user.role === 'super_admin' || allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
