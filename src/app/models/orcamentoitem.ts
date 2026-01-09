import { Orcamentoitemcampovalor } from "./orcamentoitemcampovalor";

export class Orcamentoitem {

    public idOrcamentoItem!: number;
    public idOrcamento!: number;
    public idCatalogo!: number;
    public qtItem: number = 1;
    public vlCustoUnitario!: number;
    public vlPrecoUnitario!: number;
    public vlPrecoTotal!: number;

    public orcamentoItemCampoValor!: Orcamentoitemcampovalor[];

    constructor(init?: Partial<Orcamentoitem>) {
        Object.assign(this, init);
        this.orcamentoItemCampoValor ??= [];
    }

}
