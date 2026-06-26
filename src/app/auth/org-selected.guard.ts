import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

function tratarFalhaSessao(err: { error?: { error?: string } }, router: Router) {
  const code = err?.error?.error ?? '';
  if (code === 'SUBSCRIPTION_INACTIVE') {
    router.navigate(['/client/sem-permissao'], {
      queryParams: { reason: 'assinatura' },
    });
    return of(false);
  }
  router.navigate(['/auth/login']);
  return of(false);
}

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

  if (auth.needsSessionValidation()) {
    return auth.checkAuth().pipe(
      map(() => true),
      catchError((err) => tratarFalhaSessao(err, router))
    );
  }

  const user = auth.getUser();
  if (!auth.isSessionReady() && user?.idOrganizacao) {
    auth.bootstrapSessionFromCache();
  }

  if (auth.isSessionReady()) {
    return true;
  }

  return auth.checkAuth().pipe(
    map(() => true),
    catchError((err) => tratarFalhaSessao(err, router))
  );
};
