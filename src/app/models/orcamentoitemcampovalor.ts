export class Orcamentoitemcampovalor {

    public idOrcamentoItemCampoValor!: number;
    public idOrcamentoItem!: number;
    public idCampoPersonalizado!: number;
    public nmCampoPersonalizado!: string;
    public vlInformado!: number;


    constructor(init?: Partial<Orcamentoitemcampovalor>) {
        Object.assign(this, init);
    }

}
