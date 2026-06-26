import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const orgSelectedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (auth.isSuperAdmin()) {
    router.navigate(['/admin/home']);
    return false;
  }

  if (auth.needsOrgSelection()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
