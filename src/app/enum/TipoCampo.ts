export enum TipoCampo {
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
  BOOLEAN = 'BOOLEAN'
}

export const TipoCampoLabel: Record<TipoCampo, string> = {
  [TipoCampo.NUMBER]: 'Número',
  [TipoCampo.TEXT]: 'Texto',
  [TipoCampo.BOOLEAN]: 'Booleano'
};