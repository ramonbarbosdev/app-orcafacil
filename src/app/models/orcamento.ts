import { Clientes } from "./clientes";

export class Orcamento {

    public idOrcamento!: number;
    public nuOrcamento!: string;
    public dtEmissao!: string;
    public dtValido!: string;
    public idEmpresaMetodoPrecificacao!: number;
    public idCliente!: number;
    public idCondicaoPagamento!: number;
    public dtPrazoEntrega!: string;
    public dsObservacoes!: string;
    public vlCustoBase!: number;
    public vlPrecoBase!: number;
    public vlPrecoFinal!: number;

    public cliente?: Clientes;

}
