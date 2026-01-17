import { MaterialVisualizacao } from "./material-visualizacao";

export class ItemVisualizacao {

    idItem!: number;
    descricao!: string;
    quantidade!: number;
    precoCusto!: number;
    precoUnitario!: number;
    subtotal!: number;
    materiais!: MaterialVisualizacao[];
}
