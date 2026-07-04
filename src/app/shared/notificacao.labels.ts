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
  TIMEOUT: 'O serviço demorou para responder',
  SERVICO_OFFLINE: 'Serviço de notificações offline',
  REDE: 'Falha de conexão com o serviço de notificações',
  WHATSAPP_SESSAO_PAUSADA: 'Sessão WhatsApp pausada',
  WHATSAPP_SESSAO_RISCO: 'Sessão WhatsApp em risco de bloqueio',
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
