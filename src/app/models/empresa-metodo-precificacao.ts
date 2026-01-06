export class EmpresaMetodoPrecificacao {

    public idEmpresaMetodoPrecificacao!: number;
    public idMetodoPrecificacao!: number;
    public cdMetodoPrecificacao!: string; // ENUM
    public configuracao: Record<string, any> = {};
}
