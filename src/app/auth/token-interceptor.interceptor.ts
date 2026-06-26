import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

const PUBLIC_URL_PATTERNS = [
  '/auth/login',
  '/orcamentos/visualizacao/',
  '/orcamentos/relatorio/',
];

function isPublicRequest(url: string): boolean {
  return PUBLIC_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicRequest(req.url)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getUser()?.token;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
