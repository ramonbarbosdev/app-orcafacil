export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function selectJsonFile(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result)));
        } catch {
          reject(new Error('Arquivo JSON inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsText(file);
    };
    input.click();
  });
}

export function slugArquivo(nome: string): string {
  return (nome || 'config')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function dataArquivo(): string {
  return new Date().toISOString().slice(0, 10);
}

export function extrairChavesPermissoes(payload: unknown): string[] | null {
  if (Array.isArray(payload)) {
    return payload.every((item) => typeof item === 'string') ? (payload as string[]) : null;
  }
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const obj = payload as Record<string, unknown>;
  const candidato = obj['chaves'] ?? obj['permissoes'] ?? obj['recursos'];
  if (!Array.isArray(candidato) || !candidato.every((item) => typeof item === 'string')) {
    return null;
  }
  return candidato as string[];
}

export interface LimiteImportItem {
  nmChaveLimite: string;
  nuValor: number | null;
}

export function extrairLimites(payload: unknown): LimiteImportItem[] | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const obj = payload as Record<string, unknown>;
  const candidato = Array.isArray(obj['limites']) ? obj['limites'] : Array.isArray(payload) ? payload : null;
  if (!candidato) {
    return null;
  }
  const limites: LimiteImportItem[] = [];
  for (const item of candidato) {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const limite = item as Record<string, unknown>;
    const chave = limite['nmChaveLimite'] ?? limite['nmChave'];
    if (typeof chave !== 'string' || !chave.trim()) {
      return null;
    }
    const valor = limite['nuValor'];
    limites.push({
      nmChaveLimite: chave,
      nuValor: valor === null || valor === undefined || valor === '' ? null : Number(valor),
    });
  }
  return limites;
}
