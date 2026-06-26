export interface ProporcaoLogoOpcao {
  label: string;
  valor: number | null;
}

export const PROPORCOES_LOGO: ProporcaoLogoOpcao[] = [
  { label: '2:1', valor: 2 },
  { label: '3:1', valor: 3 },
  { label: '4:1', valor: 4 },
  { label: '1:1', valor: 1 },
  { label: 'Livre', valor: null },
];

export const LARGURA_MINIMA_LOGO = 200;
export const ALTURA_MINIMA_LOGO = 80;
export const LARGURA_MAXIMA_LOGO = 2000;
export const ALTURA_MAXIMA_LOGO = 1000;
export const PROPORCAO_MINIMA_LOGO = 1;
export const PROPORCAO_MAXIMA_LOGO = 5;
export const TAMANHO_MAXIMO_LOGO_BYTES = 2 * 1024 * 1024;

export function validarImagemLogoRecortada(
  largura: number,
  altura: number,
  tamanhoBytes?: number
): string | null {
  if (largura < LARGURA_MINIMA_LOGO || altura < ALTURA_MINIMA_LOGO) {
    return `A logo deve ter pelo menos ${LARGURA_MINIMA_LOGO}×${ALTURA_MINIMA_LOGO} pixels`;
  }
  if (largura > LARGURA_MAXIMA_LOGO || altura > ALTURA_MAXIMA_LOGO) {
    return `A logo deve ter no máximo ${LARGURA_MAXIMA_LOGO}×${ALTURA_MAXIMA_LOGO} pixels`;
  }
  const proporcao = largura / altura;
  if (proporcao < PROPORCAO_MINIMA_LOGO || proporcao > PROPORCAO_MAXIMA_LOGO) {
    return 'Proporção inválida. Use uma logo entre 1:1 e 5:1';
  }
  if (tamanhoBytes != null && tamanhoBytes > TAMANHO_MAXIMO_LOGO_BYTES) {
    return 'A logo deve ter no máximo 2 MB';
  }
  return null;
}

export function extensaoPorMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    default:
      return 'png';
  }
}
