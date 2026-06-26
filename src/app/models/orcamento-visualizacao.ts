import { ClienteVisualizacao } from "./cliente-visualizacao";
import { ItemVisualizacao } from "./item-visualizacao";
import { StatusHistoricoVisualizacao } from "./status-historico-visualizacao";

export class OrcamentoVisualizacao {

    idOrcamento!: number;
    nuOrcamento!: string;
    dtEmissao!: string;
    dtValido!: string;
    status!: string;

    metodoPrecificacao!: string;
    vlPrecoBase!: number;
    vlPrecoFinal!: number;

    cliente!: ClienteVisualizacao;
    itens!: ItemVisualizacao[];
    historicoStatus!: StatusHistoricoVisualizacao[];

    nmEmpresa?: string;
    possuiLogo?: boolean;
    logoUrl?: string;
    condicaoPagamento?: string;
    nuPrazoEntrega?: number;
    observacoes?: string;
    totalDesconto?: number;
}
