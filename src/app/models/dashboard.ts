export interface DashboardContagens {
  clientes: number;
  servicos: number;
  catalogos: number;
}

export interface DashboardOrcamentoRecente {
  idOrcamento: number;
  nuOrcamento: string;
  nmCliente: string;
  vlPrecoFinal: number;
  dtEmissao: string;
  dtValido: string;
  tpStatus: string;
}

export interface DashboardSerieMensal {
  mes: string;
  totalOrcamentos: number;
  faturamentoAprovado: number;
}

export interface DashboardResumo {
  totalOrcamentos: number;
  emAndamento: number;
  aprovados: number;
  rejeitados: number;
  rascunhos: number;
  totaisPorStatus: Record<string, number>;
  faturamentoAprovadoMes: number;
  variacaoFaturamentoMes: number;
  orcamentosMes: number;
  variacaoOrcamentosMes: number;
  contagens: DashboardContagens;
  orcamentosRecentes: DashboardOrcamentoRecente[];
  serieMensal: DashboardSerieMensal[];
}

export const STATUS_ORCAMENTO_LABEL: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

export const STATUS_ORCAMENTO_COR: Record<string, string> = {
  RASCUNHO: '#94a3b8',
  GERADO: '#3b82f6',
  ENVIADO: '#f59e0b',
  APROVADO: '#22c55e',
  REJEITADO: '#ef4444',
};
