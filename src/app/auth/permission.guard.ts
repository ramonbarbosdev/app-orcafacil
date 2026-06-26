import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { mensagemSemPermissao } from '../utils/permission-labels.util';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const messageService = inject(MessageService);
  const permission = route.data['permission'] as string | undefined;

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (permission && !auth.hasPermission(permission)) {
    if (auth.hasMenuVisibilityForPermission(permission)) {
      messageService.add({
        severity: 'warn',
        summary: 'Sem permissão',
        detail: mensagemSemPermissao(permission),
        life: 7000,
      });
      router.navigate(['/client/sem-permissao'], {
        queryParams: { permission },
      });
      return false;
    }

    router.navigate(['/auth/access']);
    return false;
  }

  return true;
};
