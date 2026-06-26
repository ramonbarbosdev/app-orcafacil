import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const Error401Interceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        auth.clearSession();
        messageService.add({
          severity: 'error',
          summary: 'Sessão expirada',
          detail: 'Faça login novamente.',
        });
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
