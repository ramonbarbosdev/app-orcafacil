export const STATUS_TENTATIVA = new Set<string>([
  'CONECTANDO',
  'CONNECTING',
  'AGUARDANDO_QR',
  'PENDING_QR',
]);

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  PROCESSANDO: 'Processando',
  ENVIADA: 'Enviada',
  ENTREGUE: 'Entregue',
  LIDA: 'Lida',
  FALHOU: 'Falhou',
  BLOQUEADA: 'Bloqueada',
  CANCELADA: 'Cancelada',
};

export const STATUS_WHATSAPP_LABELS: Record<string, string> = {
  PENDING_QR: 'Pendente leitura QR',
  AGUARDANDO_QR: 'Aguardando leitura QR',
  NAO_INICIADO: 'Não iniciado',
  NOT_STARTED: 'Não iniciado',
  CONECTANDO: 'Conectando',
  CONNECTING: 'Conectando',
  CONECTADO: 'Conectado',
  DESCONECTADO: 'Desconectado',
  DESLOGADO: 'Deslogado',
  ERRO: 'Erro',
};

export const API_ERRO_LABELS: Record<string, string> = {
  BAD_REQUEST: 'Requisição inválida',
  UNAUTHORIZED: 'Não autenticado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
  CONFLICT: 'Conflito na operação',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  INTERNAL_ERROR: 'Erro interno do servidor',
  GATEWAY_INDISPONIVEL: 'Gateway WhatsApp indisponível',
  HTTP_ERROR: 'Falha na comunicação com o servidor',
  BUSINESS_ERROR: 'Operação não permitida',
  VALIDATION_ERROR: 'Dados inválidos',
};

export const INTEGRACAO_ERRO_LABELS: Record<string, string> = {
  API_KEY_INVALIDA: 'API Key inválida ou expirada',
  API_KEY_SEM_PERMISSAO: 'API Key sem permissão para esta operação',
  SERVICO_NAO_ENCONTRADO: 'Serviço de notificações indisponível',
  LIMITE_EXCEDIDO: 'Limite de envios excedido',
  SERVICO_INDISPONIVEL: 'Serviço de notificações temporariamente indisponível',
  ERRO_INTERNO_NOTIFICACAO: 'Erro interno ao processar a notificação',
  ERRO_ENVIO: 'Não foi possível enviar a mensagem',
  WHATSAPP_NAO_CONECTADO: 'WhatsApp não conectado',
  WHATSAPP_SESSAO_PAUSADA: 'Sessão WhatsApp pausada',
  WHATSAPP_SESSAO_RISCO: 'Sessão WhatsApp em risco de bloqueio',
  MENSAGEM_DUPLICADA: 'Mensagem duplicada',
  TIMEOUT: 'O serviço demorou para responder',
  SERVICO_OFFLINE: 'Serviço de notificações offline',
  REDE: 'Falha de conexão com o serviço de notificações',
  FILA_FALHA_DEFINITIVA: 'Falha definitiva no envio',
  FILA_BLOQUEADA_PROTECAO: 'Envio bloqueado por proteção',
};

export function ehStatusDeTentativa(status: string | null | undefined): boolean {
  return !!status && STATUS_TENTATIVA.has(status);
}

export function labelStatusNotificacao(status: string | null | undefined): string {
  if (!status) return '—';
  return STATUS_LABELS[status] ?? humanizarCodigo(status);
}

export function labelWhatsappStatus(status: string | null | undefined): string {
  if (!status) return 'Desconhecido';
  return STATUS_WHATSAPP_LABELS[status] ?? humanizarCodigo(status);
}

export function labelCodigoErro(codigo: string | null | undefined): string {
  if (!codigo?.trim()) return 'Erro desconhecido';
  const chave = codigo.trim().toUpperCase();
  return INTEGRACAO_ERRO_LABELS[chave] ?? API_ERRO_LABELS[chave] ?? humanizarCodigo(codigo);
}

export function resolverMensagemExibicao(
  mensagem?: string | null,
  codigo?: string | null,
  fallback = 'Ocorreu um erro. Tente novamente.'
): string {
  const msg = mensagem?.trim();
  const cod = codigo?.trim();

  if (msg && !ehCodigoTecnico(msg)) {
    return msg;
  }
  if (cod) {
    return labelCodigoErro(cod);
  }
  if (msg) {
    return labelCodigoErro(msg);
  }
  return fallback;
}

export type AvisoEnvioSeveridade = 'warn' | 'error';

export interface AvisoEnvioNotificacao {
  titulo: string;
  mensagem: string;
  severidade: AvisoEnvioSeveridade;
  notificarEquipe: boolean;
  acaoLabel?: string;
}

const CODIGOS_SEM_ALERTA_EQUIPE = new Set([
  'WHATSAPP_NAO_CONECTADO',
  'WHATSAPP_SESSAO_PAUSADA',
  'WHATSAPP_SESSAO_RISCO',
  'API_KEY_INVALIDA',
  'API_KEY_SEM_PERMISSAO',
  'LIMITE_EXCEDIDO',
  'MENSAGEM_DUPLICADA',
  'ERRO_ENVIO',
]);

export function deveNotificarEquipe(codigo?: string | null): boolean {
  if (!codigo?.trim()) {
    return false;
  }
  return !CODIGOS_SEM_ALERTA_EQUIPE.has(codigo.trim().toUpperCase());
}

export function montarAvisoEnvio(
  codigo?: string | null,
  mensagemTecnica?: string | null,
  mensagemUsuario?: string | null
): AvisoEnvioNotificacao {
  const cod = codigo?.trim().toUpperCase() ?? '';
  const msgUsuario = mensagemUsuario?.trim();
  const msgTecnica = mensagemTecnica?.trim() ?? '';

  if (cod === 'WHATSAPP_NAO_CONECTADO' || ehWhatsappNaoConectado(msgTecnica) || ehWhatsappNaoConectado(msgUsuario)) {
    return {
      titulo: 'WhatsApp não conectado',
      mensagem:
        msgUsuario ||
        'Conecte o WhatsApp em Configurações → Integrações antes de enviar mensagens ao cliente.',
      severidade: 'warn',
      notificarEquipe: false,
      acaoLabel: 'Ir para Integrações',
    };
  }

  if (cod === 'WHATSAPP_SESSAO_PAUSADA' || msgTecnica.toLowerCase().includes('pausada automaticamente')) {
    return {
      titulo: 'Envios pausados',
      mensagem:
        msgUsuario ||
        'A proteção pausou os envios WhatsApp. Aguarde ou reative a sessão em Integrações.',
      severidade: 'warn',
      notificarEquipe: false,
      acaoLabel: 'Ir para Integrações',
    };
  }

  if (cod === 'WHATSAPP_SESSAO_RISCO' || msgTecnica.toLowerCase().includes('risco operacional')) {
    return {
      titulo: 'Sessão em risco operacional',
      mensagem:
        msgUsuario ||
        'Os envios WhatsApp estão bloqueados por proteção. Corrija a causa e reative em Integrações.',
      severidade: 'warn',
      notificarEquipe: false,
      acaoLabel: 'Ir para Integrações',
    };
  }

  if (cod === 'API_KEY_INVALIDA' || cod === 'API_KEY_SEM_PERMISSAO') {
    return {
      titulo: 'Integração não configurada',
      mensagem:
        msgUsuario ||
        'A integração de notificações precisa ser revisada pelo administrador. Enquanto isso, copie a mensagem e envie manualmente.',
      severidade: 'warn',
      notificarEquipe: false,
    };
  }

  if (cod === 'LIMITE_EXCEDIDO') {
    return {
      titulo: 'Limite de envios',
      mensagem: msgUsuario || 'Muitas mensagens em pouco tempo. Aguarde alguns minutos e tente novamente.',
      severidade: 'warn',
      notificarEquipe: false,
    };
  }

  if (cod === 'MENSAGEM_DUPLICADA') {
    return {
      titulo: 'Mensagem duplicada',
      mensagem: msgUsuario || 'Esta mensagem já foi enviada recentemente. Aguarde antes de tentar de novo.',
      severidade: 'warn',
      notificarEquipe: false,
    };
  }

  const mensagem =
    msgUsuario ||
    resolverMensagemExibicao(msgTecnica, cod || null, 'Não foi possível enviar a mensagem. Tente novamente.');

  return {
    titulo: cod ? labelCodigoErro(cod) : 'Não foi possível enviar',
    mensagem,
    severidade: 'error',
    notificarEquipe: deveNotificarEquipe(cod),
  };
}

function ehWhatsappNaoConectado(texto?: string | null): boolean {
  if (!texto?.trim()) {
    return false;
  }
  const valor = texto.toLowerCase();
  return valor.includes('whatsapp') && (valor.includes('nao conectado') || valor.includes('não conectado'));
}

function ehCodigoTecnico(texto: string): boolean {
  const valor = texto.trim();
  return /^[A-Z][A-Z0-9_]*$/.test(valor) && valor.includes('_');
}

function humanizarCodigo(codigo: string): string {
  return codigo
    .trim()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
