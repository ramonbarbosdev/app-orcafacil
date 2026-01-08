import { Campopersonalizado } from "./campopersonalizado";
import { Catalogocampo } from "./catalogocampo";

export class Catalogo {
    public idCatalogo!: number;
    public idTenant!: string;
    public cdCatalogo!: string;
    public nmCatalogo!: string;
    public dsCatalogo!: string;
    public vlCustoBase!: number;
    public vlPrecoBase!: number;

    camposSelecionados!: Campopersonalizado[];

    catalogoCampo!: Catalogocampo[];
}
