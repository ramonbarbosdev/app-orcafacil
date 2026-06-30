import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Orcamentoitem } from '../../../../../models/orcamentoitem';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../../../../layout/service/layout.service';
import { DividerModule } from 'primeng/divider';
import { BaseService } from '../../../../../services/base.service';
import { FlagOption } from '../../../../../models/flag-option';
import { SelectModule } from 'primeng/select';
import { OrcamentoItemAjusteForm } from '../orcamento-item-ajuste-form/orcamento-item-ajuste-form';
import { Orcamentoitemcampovalor } from '../../../../../models/orcamentoitemcampovalor';
import { ConfirmationService } from 'primeng/api';
import { SelectCadastroRapido } from '../../../../../components/select-cadastro-rapido/select-cadastro-rapido';


export interface GridColuna {
  key: string;
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
  tipo?: 'select' | 'number' | 'currency' | 'readonly' | 'action';
  destaque?: boolean;
}

@Component({
  selector: 'app-orcamento-item-form',
  imports: [InputNumberModule, FormsModule, CommonModule, InputTextModule, ButtonModule, DividerModule, SelectModule, OrcamentoItemAjusteForm, SelectCadastroRapido],
  templateUrl: './orcamento-item-form.html',
  styleUrl: './orcamento-item-form.scss',
})
export class OrcamentoItemForm {
  @Input() itens: Orcamentoitem[] = [];
  @Output() itensChange = new EventEmitter<Orcamentoitem[]>();
  @Output() totalChange = new EventEmitter<number>();

  layoutService = inject(LayoutService);
  public baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  private confirmationService = inject(ConfirmationService);

  public listaCatalogo: FlagOption[] = [];
  ajusteVisible: boolean = false;
  itemSelecionado?: any;

  total = 0;

  colunas: GridColuna[] = [
    { key: 'idCatalogo', label: 'Item', width: '35%', tipo: 'select' },
    { key: 'qtItem', label: 'Qtd', width: '10%', align: 'left', tipo: 'number' },
    { key: 'vlCustoUnitario', label: 'Custo', width: '15%', align: 'left', tipo: 'currency' },
    { key: 'vlPrecoUnitario', label: 'Unitário', width: '15%', align: 'left', tipo: 'currency' },
    { key: 'vlPrecoTotal', label: 'Subtotal', width: '10%', align: 'left', tipo: 'readonly', destaque: true },
    { key: 'acao', label: '', width: '5%', tipo: 'action' }
  ];

  get gridTemplate(): string {
    return this.colunas.map(c => c.width).join(' ');
  }

  getCatalogosDisponiveis(indexAtual: number): FlagOption[] {
    const catalogosSelecionados = new Set(
      (this.itens ?? [])
        .map((item, index) => index === indexAtual ? null : Number(item.idCatalogo))
        .filter(id => !!id)
    );

    return this.listaCatalogo.filter(catalogo =>
      !catalogosSelecionados.has(Number(catalogo.code))
    );
  }

  hideDialog() {
    this.ajusteVisible = false;
  }

  ngOnInit(): void {
    this.obterCatalogo()
    if (!this.itens || this.itens.length === 0) {
      this.adicionarItem();

    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itens'] && Array.isArray(changes['itens'].currentValue)) {
      this.recalcular();
    }
  }

  private criarItem(): Orcamentoitem {
    return new Orcamentoitem();
  }

  adicionarItem(): void {
    const novoItem = this.criarItem();
    const base = Array.isArray(this.itens) ? this.itens : [];

    const novosItens = [...base, novoItem];

    this.itensChange.emit(novosItens);

  }

  removerItem(index: any): void {
    if (!Array.isArray(this.itens)) return;

    this.itensChange.emit(this.itens.filter((_, i) => i !== index));
    // this.recalcular();
  }

  //funcoes de regra 

  abrirAjuste(index: any): void {
    this.itemSelecionado = this.itens[index];

    if (this.itemSelecionado.idCatalogo) {
      this.ajusteVisible = true;
    }
    else {
      this.confirmationService.confirm({
        message: 'O item não foi selecionado!',
        header: 'Aviso',
        icon: 'pi pi-exclamation-triangle',
        acceptVisible: false,
        rejectVisible: false,
      });
    }
  }

  recalcular(): void {
    if (!Array.isArray(this.itens)) {
      this.totalChange.emit(0);
      return;
    }

    let totalOrcamento = 0;

    for (const item of this.itens) {

      const quantidade = Number(item.qtItem) || 0;
      const custoUnitario = Number(item.vlCustoUnitario) || 0;

      let totalItem = custoUnitario * quantidade;

      for (const campo of item.orcamentoItemCampoValor ?? []) {
        const valor = Number(campo.vlInformado) || 0;

        switch (campo.tpValor) {

          case 'PRECO_FIXO':
            totalItem += valor;
            break;

          case 'CUSTO_UNITARIO':
            totalItem += valor * quantidade;
            break;

          case 'AJUSTE_METODO':
            break;
        }
      }

      item.vlPrecoTotal = totalItem;
      totalOrcamento += totalItem;
    }

    this.total = totalOrcamento;
    this.totalChange.emit(totalOrcamento);
    this.itensChange.emit(this.itens);
  }


  processarCatalogo(event: any, index: any) {

    const item = this.listaCatalogo.find((a) => a.code === event);
    if (item && item.extra) {
      const catalogoSelecionado = this.listaCatalogo.find(
        c => c.code === event
      );

      if (!catalogoSelecionado || !catalogoSelecionado.extra) {
        return;
      }

      const itemAtual = this.itens[index];

      const novosCampos = this.mapearCamposCatalogoParaItem(
        catalogoSelecionado.extra['catalogoCampo'],
        itemAtual.idOrcamentoItem
      );

      const itemAtualizado = new Orcamentoitem({
        ...itemAtual,
        idCatalogo: Number(catalogoSelecionado.code),
        vlCustoUnitario: catalogoSelecionado.extra['vlCustoBase'],
        vlPrecoUnitario: catalogoSelecionado.extra['vlPrecoBase'] ?? 0,
        orcamentoItemCampoValor: novosCampos
      });

      this.itens = this.itens.map((it, i) =>
        i === index ? itemAtualizado : it
      );

      this.recalcular();
    }

  }

  obterCatalogo() {

    this.baseService.findAll('catalogos').subscribe({
      next: (res) => {
        this.atualizarListaCatalogo(this.mapearCatalogos(res as any[]));
        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

  atualizarListaCatalogo(opcoes: FlagOption[]) {
    this.listaCatalogo = opcoes.map((c) => {
      const item = new FlagOption();
      item.code = c.code;
      item.name = c.name;
      item.extra = c.extra ?? {
        vlCustoBase: (c as any).vlCustoBase,
        vlPrecoBase: (c as any).vlPrecoBase,
        catalogoCampo: (c as any).catalogoCampo,
      };
      return item;
    });
  }

  private mapearCatalogos(res: any[]): FlagOption[] {
    return res.map((index) => {
      const item = new FlagOption();
      item.code = index.idCatalogo;
      item.name = index.nmCatalogo;
      item.extra = {
        vlCustoBase: index.vlCustoBase,
        vlPrecoBase: index.vlPrecoBase,
        catalogoCampo: index.catalogoCampo,
      };
      return item;
    });
  }

  private mapearCamposCatalogoParaItem(
    catalogoCampos: any[],
    idOrcamentoItem?: number
  ): Orcamentoitemcampovalor[] {

    return catalogoCampos.map(campo => {
      return {
        idOrcamentoItemCampoValor: 0,
        idOrcamentoItem: idOrcamentoItem ?? 0,
        idCampoPersonalizado: campo.idCampoPersonalizado,
        vlInformado: campo.vlPadrao ?? 0,
        dsDescricao: campo.dsDescricao ?? '',
        tpValor: campo.tpCampoValor
      } as Orcamentoitemcampovalor;
    });
  }

  recalcularItem(item: Orcamentoitem): Orcamentoitem {
    const vlPrecoUnitario = item.orcamentoItemCampoValor.reduce(
      (acc, c) => acc + (Number(c.vlInformado) || 0),
      0
    );

    const vlPrecoTotal =
      (item.vlCustoUnitario + vlPrecoUnitario) * item.qtItem;

    return new Orcamentoitem({
      ...item,
      vlPrecoUnitario,
      vlPrecoTotal
    });
  }

  onConfirmarAjustes(itemAtualizado: Orcamentoitem) {

    const itemRecalculado = this.recalcularItem(itemAtualizado);

    this.itens = this.itens.map((it, i) =>
      it.idCatalogo === this.itemSelecionado.idCatalogo ? itemRecalculado : it
    );

    this.ajusteVisible = false;

    this.recalcular()

  }




}
