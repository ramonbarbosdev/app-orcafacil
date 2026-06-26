import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';

export const Error403Interceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Sem permissão',
          detail: err.error?.message ?? 'Você não tem permissão para esta ação.',
        });
      }
      return throwError(() => err);
    })
  );
};
