const RECURSOS: Record<string, string> = {
  clientes: 'Clientes',
  'campos-personalizados': 'Materiais',
  catalogos: 'Catálogo',
  orcamentos: 'Orçamentos',
  'condicoes-pagamento': 'Condições de Pagamento',
  'configuracao-orcamento': 'Configuração',
  'categorias-servico': 'Categorias de Serviço',
  servicos: 'Serviços',
  'metodos-precificacao': 'Configuração',
  'metodos-ajuste': 'Configuração',
  'empresa-metodos-precificacao': 'Configuração',
};

const ACOES: Record<string, string> = {
  exibir: 'exibir no menu',
  ler: 'consultar',
  criar: 'criar',
  editar: 'editar',
  deletar: 'excluir',
};

export function moduloDaPermissao(permission: string): string {
  const ponto = permission.lastIndexOf('.');
  return ponto > 0 ? permission.slice(0, ponto) : permission;
}

export function acaoDaPermissao(permission: string): string {
  const ponto = permission.lastIndexOf('.');
  return ponto > 0 ? permission.slice(ponto + 1) : 'ler';
}

export function nomeRecurso(modulo: string): string {
  return RECURSOS[modulo] ?? modulo;
}

export function descricaoAcaoPermissao(acao: string): string {
  return ACOES[acao] ?? acao;
}

export function mensagemSemPermissao(permission: string): string {
  const modulo = moduloDaPermissao(permission);
  const acao = acaoDaPermissao(permission);
  return `Você não possui permissão para ${descricaoAcaoPermissao(acao)} em ${nomeRecurso(modulo)}.`;
}
