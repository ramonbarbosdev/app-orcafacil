import { ApiError } from '../models/api.types';

export interface ParsedHttpError {
  summary: string;
  detail: string;
  severity: 'error' | 'warn' | 'info';
}

function asApiError(body: unknown): ApiError | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  return body as ApiError;
}

function joinMessage(message?: string, hint?: string): string {
  const parts = [message, hint].filter((part) => !!part?.trim());
  return parts.join(' ');
}

export function parseHttpError(status: number, body: unknown): ParsedHttpError {
  const err = asApiError(body);
  const code = err?.error ?? '';
  const composed = joinMessage(err?.message, err?.hint);

  if (status === 403) {
    switch (code) {
      case 'PLATFORM_ADMIN_REQUIRED':
        return {
          summary: 'Acesso restrito',
          detail:
            composed ||
            'Esta área é exclusiva para administradores da plataforma. Se você precisa de acesso administrativo, entre em contato com o suporte.',
          severity: 'warn',
        };
      case 'ORGANIZATION_REQUIRED':
        return {
          summary: 'Organização não selecionada',
          detail:
            composed ||
            'Selecione uma organização para continuar. Escolha a empresa na qual deseja trabalhar antes de acessar este recurso.',
          severity: 'warn',
        };
      case 'ACCESS_DENIED':
      default:
        return {
          summary: 'Acesso não permitido',
          detail:
            composed ||
            'Você não tem permissão para realizar esta ação. Solicite ao administrador da sua organização a liberação deste acesso.',
          severity: 'warn',
        };
    }
  }

  if (status === 401) {
    return {
      summary: code === 'UNAUTHORIZED' ? 'Autenticação necessária' : 'Não autorizado',
      detail:
        composed ||
        'Não foi possível concluir a operação. Verifique se você está autenticado e com a organização correta selecionada.',
      severity: 'warn',
    };
  }

  return {
    summary: err?.message ?? 'Erro',
    detail: err?.error ?? 'Ocorreu um erro inesperado. Tente novamente.',
    severity: 'error',
  };
}

export function isAuthHandledStatus(status: number): boolean {
  return status === 401 || status === 403;
}
