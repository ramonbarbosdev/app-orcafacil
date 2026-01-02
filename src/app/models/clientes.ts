export class Clientes {
  public idCliente!: number;
  public idTenant: string = '';
  public tpCliente: string = '';
  public nuCpfcnpj: string = '';
  public nmCliente: string = '';
  public dsEmail: string = '';
  public nuTelefone: string = '';
  public dsObservacoes: string = '';
  public flAtivo: boolean = true;
  public idUsuario!: number;
  public dtCadastro: Date | null = null;
}


