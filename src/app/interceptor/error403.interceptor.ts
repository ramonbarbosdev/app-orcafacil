import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { inject } from '@angular/core';

export const Error403Interceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 403) {
        const isAdminRoute = req.url.includes('/admin/');
        messageService.add({
          severity: 'warn',
          summary: 'Sem permissão',
          detail: isAdminRoute
            ? (err.error?.message ?? 'Acesso negado na administração da plataforma.')
            : (err.error?.message ?? 'Você não tem permissão para esta ação.'),
        });
      }
      return throwError(() => err);
    })
  );
};
