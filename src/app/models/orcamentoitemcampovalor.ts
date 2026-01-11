export class Orcamentoitemcampovalor {

    public idOrcamentoItemCampoValor!: number;
    public idOrcamentoItem: number = 0;
    public idCampoPersonalizado: number = 0;
    public nmCampoPersonalizado!: string;
    public vlInformado: number = 0;
    public tpValor!: string;


    constructor(init?: Partial<Orcamentoitemcampovalor>) {
        Object.assign(this, init);
    }

}
