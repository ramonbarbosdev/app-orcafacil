import { Orcamentoitemcampovalor } from "./orcamentoitemcampovalor";

export class Orcamentoitem {

    public idOrcamentoItem!: number;
    public idOrcamento!: number;
    public idCatalogo!: number;
    public qtItem: number = 1;
    public vlCustoUnitario: number = 0;
    public vlPrecoUnitario: number = 0;
    public vlPrecoTotal: number = 0 ;

    public orcamentoItemCampoValor!: Orcamentoitemcampovalor[];

    constructor(init?: Partial<Orcamentoitem>) {
        Object.assign(this, init);
    }

}
