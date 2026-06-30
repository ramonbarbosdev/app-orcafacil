export interface CampoMetodoDTO {
  nome: string;
  label: string;
  tipo: 'NUMBER' | 'TEXT' | 'BOOLEAN';
  obrigatorio: boolean;
}

export interface MetodoPrecificacaoMetaDTO {
  idMetodoPrecificacao: number;
  cdMetodoPrecificacao: string;
  nmMetodoPrecificacao: string;
  dsMetodoPrecificacao: string;
  campos: CampoMetodoDTO[];
}
