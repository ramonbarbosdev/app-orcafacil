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
