import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return auth.checkAuth().pipe(
    map((me) => {
      if (!me || me.tipoGlobal !== 'SUPER_ADMIN' || me.idOrganizacao != null) {
        router.navigate(['/auth/access']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      auth.clearSession();
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
