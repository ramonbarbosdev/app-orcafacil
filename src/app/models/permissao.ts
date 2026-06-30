export interface PermissaoItem {
  idPermissao: number;
  nmPermissao: string;
  nmChave: string;
  acao: string;
}

export interface PermissaoModulo {
  modulo: string;
  nmModulo: string;
  permissoes: PermissaoItem[];
}

export interface PapelListItem {
  idPapel: number;
  nmPapel: string;
  flAtivo: boolean;
  totalPermissoes: number;
}

export interface PapelDetalhe {
  idPapel: number;
  nmPapel: string;
  chaves: string[];
}

export interface ModuloPermissaoAdmin {
  modulo: string;
  nmModulo: string;
  flAtivo: boolean;
  totalPermissoes: number;
  permissoes: PermissaoItem[];
}

export interface ModuloPermissaoRequest {
  codigoModulo: string;
  nmModulo: string;
}

export interface ModuloPermissaoUpdate {
  nmModulo: string;
  flAtivo: boolean;
}

export type CatalogoRecursoStatus = 'COMPLETO' | 'PARCIAL' | 'PENDENTE';

export interface CatalogoRecursoItem {
  modulo: string;
  label: string;
  rota: string;
  grupo: string;
  origem: string;
  cadastrado: boolean;
  noCatalogoCurado: boolean;
  status: CatalogoRecursoStatus;
  acoesSugeridas: string[];
  permissoesExistentes: string[];
}

export interface RegistrarRecursoRequest {
  recurso: string;
  descricao?: string;
  acoes?: string[];
}

export interface RegistrarRecursoResponse {
  modulo: string;
  criadas: string[];
  jaExistentes: string[];
}

export interface PermissaoDetalhe {
  idPermissao: number;
  nmChave: string;
  modulo: string;
  acao: string;
  descricao: string;
  flAtivo: boolean;
}

export interface PermissaoItemRequest {
  modulo: string;
  acao: string;
  descricao?: string;
}
