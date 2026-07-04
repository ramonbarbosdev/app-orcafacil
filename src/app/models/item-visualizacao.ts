import { MaterialVisualizacao } from "./material-visualizacao";

export class ItemVisualizacao {

    idItem!: number;
    codigo?: string;
    descricao!: string;
    quantidade!: number;
    precoCusto!: number;
    precoUnitario!: number;
    subtotal!: number;
    tipo?: string;
    materiais!: MaterialVisualizacao[];
}
