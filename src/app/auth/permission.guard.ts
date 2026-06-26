import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const permission = route.data['permission'] as string | undefined;

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (permission && !auth.hasPermission(permission)) {
    router.navigate(['/auth/access']);
    return false;
  }

  return true;
};
