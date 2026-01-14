import { Clientes } from "./clientes";
import { Orcamentoitem } from "./orcamentoitem";

export class Orcamento {

    public idOrcamento!: number;
    public nuOrcamento!: string;
    public dtEmissao!: string;
    public dtValido!: string;
    public idEmpresaMetodoPrecificacao!: number;
    public idCliente!: number;
    public idCondicaoPagamento!: number;
    public nuPrazoEntrega!: number;
    public dsObservacoes!: string;
    public vlPreview!: number;
    public vlPrecoBase!: number;
    public vlPrecoFinal: number = 0;
    public descricaoMetodo!: string;
    public tpStatus!: string;


    public cliente?: Clientes;
    public orcamentoItem!: Orcamentoitem[];

}
