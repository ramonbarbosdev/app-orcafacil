import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { parseHttpError } from '../utils/http-error.util';

export const Error401Interceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        if (req.url.includes('/auth/me')) {
          auth.clearSession();
          messageService.add({
            severity: 'error',
            summary: 'Sessão expirada',
            detail: 'Sua sessão não é mais válida. Faça login novamente para continuar.',
            life: 8000,
          });
          router.navigate(['/auth/login']);
        } else {
          const parsed = parseHttpError(401, err.error);
          messageService.add({
            severity: parsed.severity,
            summary: parsed.summary,
            detail: parsed.detail,
            life: 8000,
          });
        }
      }
      return throwError(() => err);
    })
  );
};
