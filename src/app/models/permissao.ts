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
