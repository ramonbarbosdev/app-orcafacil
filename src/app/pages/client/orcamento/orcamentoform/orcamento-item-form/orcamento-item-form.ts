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
  imports: [InputNumberModule, FormsModule, CommonModule, InputTextModule, ButtonModule, DividerModule, SelectModule],
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
  public listaCatalogo: FlagOption[] = [];


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
    return {
      idCatalogo: 0,
      qtItem: 1,
      vlPrecoUnitario: 0,
      vlPrecoTotal: 0,
      vlCustoUnitario: 0
    } as Orcamentoitem;
  }

  adicionarItem(): void {
    const novoItem = this.criarItem();
    const base = Array.isArray(this.itens) ? this.itens : [];

    const novosItens = [...base, novoItem];

    this.itensChange.emit(novosItens);

    // setTimeout(() => {
    //   this.inputs?.last?.nativeElement.focus();
    // });
  }

  removerItem(index: any): void {
    if (!Array.isArray(this.itens)) return;

    this.itensChange.emit(this.itens.filter((_, i) => i !== index));
  }

  recalcular(): void {
    if (!Array.isArray(this.itens)) {
      this.totalChange.emit(0);
      return;
    }

    const total = this.itens.reduce((acc, item) => {
      item.qtItem ||= 0;
      item.vlPrecoUnitario ||= 0;

      item.vlPrecoTotal = item.qtItem * item.vlPrecoUnitario;
      return acc + item.vlPrecoTotal;
    }, 0);

    this.total = total;
    this.totalChange.emit(total);
  }

  processarCatalogo(event: any, index: any) {

    const item = this.listaCatalogo.find((a) => a.code === event);

    if (item && item.extra) {
      this.itens[index].vlCustoUnitario = item.extra['vlCustoBase'];
      this.itens[index].vlPrecoUnitario = item.extra['vlPrecoBase'];
      this.recalcular();
    }

  }

  obterCatalogo() {

    this.baseService.findAll('catalogo/').subscribe({
      next: (res) => {

        this.listaCatalogo = (res as any).map((index: any) => {

          const item = new FlagOption();
          item.code = index.idCatalogo;
          item.name = index.nmCatalogo;
          item.extra = {
            vlCustoBase: index.vlCustoBase,
            vlPrecoBase: index.vlPrecoBase,
          };
          this.cd.markForCheck();
          return item;
        });

        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }




}
