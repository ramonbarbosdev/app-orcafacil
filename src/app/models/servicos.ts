export class Servicos {
  public id_servico!: number;
  public cd_servico: string = '';
  public nm_servico: string = '';
  public id_categoriaservico!: number;
  public vl_preco!: number;
  public ds_observacoes: string = '';
  public dt_cadastro: Date | null = null;
}
