import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { parseHttpError } from '../utils/http-error.util';

const SESSION_INVALID_CODES = new Set([
  'INVALID_TOKEN',
  'INVALID_VINCULO',
  'ORGANIZATION_UNAVAILABLE',
]);

export const Error401Interceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status !== 401 || req.url.includes('/auth/login')) {
        return throwError(() => err);
      }

      const code = err.error?.error ?? '';
      const parsed = parseHttpError(401, err.error);

      if (code === 'SUBSCRIPTION_INACTIVE') {
        messageService.add({
          severity: parsed.severity,
          summary: parsed.summary,
          detail: parsed.detail,
          life: 10000,
        });
        router.navigate(['/client/sem-permissao'], {
          queryParams: { reason: 'assinatura' },
        });
        return throwError(() => err);
      }

      const isAuthMe = req.url.includes('/auth/me');
      const shouldResetSession = isAuthMe || SESSION_INVALID_CODES.has(code);

      if (!shouldResetSession) {
        return throwError(() => err);
      }

      auth.clearSession();
      messageService.add({
        severity: parsed.severity,
        summary: parsed.summary,
        detail: parsed.detail,
        life: 8000,
      });
      router.navigate(['/auth/login']);

      return throwError(() => err);
    })
  );
};
