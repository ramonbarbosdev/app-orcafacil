export type OrganizacaoLogoModo = 'UPLOAD' | 'URL' | 'NENHUM';

export interface OrganizacaoLogoMetadados {
  possuiLogo: boolean;
  modo: OrganizacaoLogoModo;
  url: string | null;
  logoUrlExterna: string | null;
  contentType: string | null;
  tamanhoBytes: number | null;
  largura: number | null;
  altura: number | null;
  atualizadaEm: string | null;
}

export const LOGO_PADRAO_URL = '/logo.svg';
