import { HttpInterceptorFn } from '@angular/common/http';

const STORAGE_KEY = 'user';

const PUBLIC_URL_PATTERNS = [
  '/auth/login',
  '/orcamentos/visualizacao/',
  '/orcamentos/relatorio/',
];

function isPublicRequest(url: string): boolean {
  return PUBLIC_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

function readTokenFromStorage(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    const token = parsed?.token?.trim();
    return token || null;
  } catch {
    return null;
  }
}

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicRequest(req.url)) {
    return next(req);
  }

  const token = readTokenFromStorage();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
