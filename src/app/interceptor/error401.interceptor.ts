import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { parseHttpError } from '../utils/http-error.util';

const SESSION_INVALID_CODES = new Set([
  'UNAUTHORIZED',
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
      const shouldResetSession =
        req.url.includes('/auth/me') || SESSION_INVALID_CODES.has(code) || !auth.hasOrgSelected();

      if (shouldResetSession) {
        auth.clearSession();
      }

      messageService.add({
        severity: parsed.severity,
        summary: parsed.summary,
        detail: parsed.detail,
        life: 8000,
      });

      if (shouldResetSession && !req.url.includes('/auth/me')) {
        router.navigate(['/auth/login']);
      } else if (req.url.includes('/auth/me')) {
        router.navigate(['/auth/login']);
      }

      return throwError(() => err);
    })
  );
};
