import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';
import { parseHttpError } from '../utils/http-error.util';

export const Error403Interceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 403) {
        const parsed = parseHttpError(403, err.error);
        messageService.add({
          severity: parsed.severity,
          summary: parsed.summary,
          detail: parsed.detail,
          life: 8000,
        });
      }
      return throwError(() => err);
    })
  );
};
