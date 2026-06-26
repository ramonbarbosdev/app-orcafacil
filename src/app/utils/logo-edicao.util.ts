export interface ProporcaoLogoOpcao {
  label: string;
  valor: number;
}

/** Proporções aceitas pelo layout do sistema (logo horizontal). */
export const PROPORCOES_LOGO: ProporcaoLogoOpcao[] = [
  { label: '2:1', valor: 2 },
  { label: '3:1', valor: 3 },
  { label: '4:1', valor: 4 },
];

export const PROPORCAO_IDEAL_PADRAO = 2;
export const PROPORCOES_IDEAIS_VALORES: readonly number[] = [2, 3, 4];
export const TOLERANCIA_PROPORCAO_IDEAL = 0.08;

export const LARGURA_MINIMA_LOGO = 200;
export const ALTURA_MINIMA_LOGO = 80;
export const LARGURA_MAXIMA_LOGO = 2000;
export const ALTURA_MAXIMA_LOGO = 1000;
export const TAMANHO_MAXIMO_LOGO_BYTES = 2 * 1024 * 1024;

const MIME_PERMITIDOS = new Set(['image/png', 'image/jpeg', 'image/webp']);

export interface DimensoesImagem {
  largura: number;
  altura: number;
}

export function lerDimensoesImagem(file: File): Promise<DimensoesImagem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const imagem = new Image();
    imagem.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ largura: imagem.naturalWidth, altura: imagem.naturalHeight });
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem'));
    };
    imagem.src = url;
  });
}

export function detectarProporcaoIdeal(largura: number, altura: number): ProporcaoLogoOpcao {
  const proporcao = largura / altura;
  let melhor = PROPORCOES_LOGO[0];
  let menorDiferenca = Number.POSITIVE_INFINITY;

  for (const opcao of PROPORCOES_LOGO) {
    const diferenca = Math.abs(proporcao - opcao.valor) / opcao.valor;
    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      melhor = opcao;
    }
  }

  return melhor;
}

export function proporcaoCorrespondeIdeal(largura: number, altura: number): boolean {
  const proporcao = largura / altura;
  return PROPORCOES_IDEAIS_VALORES.some(
    (ideal) => Math.abs(proporcao - ideal) / ideal <= TOLERANCIA_PROPORCAO_IDEAL
  );
}

export function validarArquivoBasico(file: File): string | null {
  const extensoes = ['.png', '.jpg', '.jpeg', '.webp'];
  const nome = file.name.toLowerCase();
  if (!extensoes.some((ext) => nome.endsWith(ext))) {
    return 'Envie uma imagem PNG, JPG ou WEBP';
  }
  const tipo = file.type.toLowerCase();
  if (tipo && !MIME_PERMITIDOS.has(tipo)) {
    return 'Tipo de arquivo não permitido. Use PNG, JPG ou WEBP';
  }
  if (file.size > TAMANHO_MAXIMO_LOGO_BYTES) {
    return 'A logo deve ter no máximo 2 MB';
  }
  return null;
}

/** Valida a imagem original antes de abrir o editor. */
export function validarImagemAntesEditor(largura: number, altura: number): string | null {
  if (largura < LARGURA_MINIMA_LOGO || altura < ALTURA_MINIMA_LOGO) {
    return `A imagem deve ter pelo menos ${LARGURA_MINIMA_LOGO}×${ALTURA_MINIMA_LOGO} pixels para recortar`;
  }
  const areaMinimaRecorte =
    LARGURA_MINIMA_LOGO * ALTURA_MINIMA_LOGO;
  if (largura * altura < areaMinimaRecorte) {
    return 'A imagem é pequena demais para gerar uma logo no tamanho mínimo aceito';
  }
  return null;
}

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
  if (tamanhoBytes != null && tamanhoBytes > TAMANHO_MAXIMO_LOGO_BYTES) {
    return 'A logo deve ter no máximo 2 MB';
  }
  return null;
}

/** Validação final antes do upload — exige proporção 2:1, 3:1 ou 4:1. */
export function validarLogoParaUpload(
  largura: number,
  altura: number,
  tamanhoBytes?: number
): string | null {
  const erroBase = validarImagemLogoRecortada(largura, altura, tamanhoBytes);
  if (erroBase) {
    return erroBase;
  }
  if (!proporcaoCorrespondeIdeal(largura, altura)) {
    return 'Proporção inválida. Use 2:1, 3:1 ou 4:1 e recorte sem espaço em branco ao redor';
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
