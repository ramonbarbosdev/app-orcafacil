export enum TipoValor {
  PRECO_FIXO = 'PRECO_FIXO',
  CUSTO_UNITARIO = 'CUSTO_UNITARIO',
  AJUSTE_METODO = 'AJUSTE_METODO'
}

export const TipoValorLabel: Record<TipoValor, string> = {
  [TipoValor.PRECO_FIXO]: 'Preço Fixo',
  [TipoValor.CUSTO_UNITARIO]: 'Custo Unitário',
  [TipoValor.AJUSTE_METODO]: 'Ajuste pelo Método'
};