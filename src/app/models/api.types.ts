export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface LoginRequest {
  nuCpf: string;
  dsSenha: string;
}

export interface OrganizacaoResumo {
  idOrganizacao: number;
  nmOrganizacao: string;
  dsRole: string;
}

export interface LoginResponse {
  token: string;
  tipoGlobal: 'SUPER_ADMIN' | 'DEFAULT';
  precisaSelecionarOrganizacao: boolean;
  organizacoes: OrganizacaoResumo[];
}

export interface SelecionarOrgRequest {
  idOrganizacao: number;
}

export interface SelecionarOrgResponse {
  token: string;
  idOrganizacao: number;
  role: string;
  permissoes: string[];
}

export interface MeResponse {
  idUsuario: number;
  tipoGlobal: string;
  idOrganizacao: number | null;
  role: string | null;
  permissoes: string[];
}

export interface SessionUser {
  token: string;
  tipoGlobal: 'SUPER_ADMIN' | 'DEFAULT';
  idOrganizacao?: number;
  role?: string;
  permissoes: string[];
  idUsuario?: number;
}

export type StatusOrcamento = 'RASCUNHO' | 'GERADO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO';
export type TipoPrecificacao = 'MARKUP' | 'SIMPLES' | 'MARGEM' | 'FIXO';
export type TipoCampoValor = 'PRECO_FIXO' | 'CUSTO_UNITARIO' | 'AJUSTE_METODO';
export type TipoCliente = 'Fisico' | 'Juridico';
export type TipoItem = 'Produto' | 'Servico';
