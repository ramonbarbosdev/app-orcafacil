import { Component, ElementRef, EventEmitter, inject, Input, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Orcamentoitem } from '../../../../../models/orcamentoitem';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../../../../layout/service/layout.service';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-orcamento-item-form',
  imports: [InputNumberModule, FormsModule, CommonModule, InputTextModule, ButtonModule, DividerModule],
  templateUrl: './orcamento-item-form.html',
  styleUrl: './orcamento-item-form.scss',
})
export class OrcamentoItemForm {
  @Input() itens: Orcamentoitem[] = [];
  @Output() itensChange = new EventEmitter<Orcamentoitem[]>();
  @Output() totalChange = new EventEmitter<number>();

  layoutService = inject(LayoutService);

  @ViewChildren('descricaoInput') inputs!: QueryList<ElementRef>;

  total = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itens'] && Array.isArray(changes['itens'].currentValue)) {
      this.recalcular();
    }
  }

  private criarItem(): Orcamentoitem {
    return {
      dsItem: '',
      qtItem: 1,
      vlPrecoUnitario: 0,
      vlPrecoTotal: 0
    } as Orcamentoitem;
  }

  adicionarItem(): void {
    const novoItem = this.criarItem();
    const base = Array.isArray(this.itens) ? this.itens : [];

    const novosItens = [...base, novoItem];

    this.itensChange.emit(novosItens);

    setTimeout(() => {
      this.inputs?.last?.nativeElement.focus();
    });
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




}
