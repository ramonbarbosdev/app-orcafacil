import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Orcamentoitem } from '../../../../../models/orcamentoitem';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { BaseService } from '../../../../../services/base.service';
import { FlagOption } from '../../../../../models/flag-option';
import { Orcamentoitemcampovalor } from '../../../../../models/orcamentoitemcampovalor';
import { LayoutCampo } from "../../../../../components/layout-campo/layout-campo";
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-orcamento-item-ajuste-form',
  imports: [DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputNumberModule, LayoutCampo, DividerModule, InputTextModule],
  templateUrl: './orcamento-item-ajuste-form.html',
  styleUrl: './orcamento-item-ajuste-form.scss',
})
export class OrcamentoItemAjusteForm {
  @Input() item!: Orcamentoitem;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() show = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<Orcamentoitem>();

  private cd = inject(ChangeDetectorRef);
  public baseService = inject(BaseService);

  itemEditavel!: Orcamentoitem;
  public listaCampos: FlagOption[] = [];

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.cancel.emit();
  }

  showDialog() {

    this.itemEditavel = new Orcamentoitem({
      ...this.item,
      orcamentoItemCampoValor: this.item.orcamentoItemCampoValor.map(c => ({ ...c }))
    });
    this.obterCampos()

  }

  adicionarCampo() {

    this.itemEditavel.orcamentoItemCampoValor = [
      ...this.itemEditavel.orcamentoItemCampoValor,
      new Orcamentoitemcampovalor()
    ];
  }

  removerCampo(campo: Orcamentoitemcampovalor) {
    this.itemEditavel.orcamentoItemCampoValor =
      this.itemEditavel.orcamentoItemCampoValor.filter(c => c !== campo);
  }

  get camposUsados(): number[] {
    return this.itemEditavel.orcamentoItemCampoValor
      .map(c => c.idCampoPersonalizado)
      .filter(id => id !== null) as number[];
  }

  getListaCamposDisponiveis(campoAtual?: Orcamentoitemcampovalor) {
    return this.listaCampos.filter(op =>
      !this.camposUsados.includes(Number(op.code)) ||
      op.code === campoAtual?.idCampoPersonalizado
    );
  }

  processarCampo(event: any, campo?: Orcamentoitemcampovalor) {

    const item = this.listaCampos.find((a) => a.code === event);
    if (item && item.extra) {
      campo!.tpValor = item.extra['tpCampoValor'];
      
    }
  }


  obterCampos() {

    this.baseService.findAll('campopersonalizado/').subscribe({
      next: (res) => {
        this.listaCampos = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index.idCampoPersonalizado;
          item.name = index.nmCampoPersonalizado;
          item.extra = {
            tpCampoValor: index.tpCampoValor,
          };
          return item;
        });

        // this.itens[0].idCatalogo = Number(this.listaCatalogo[0].code);

        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

  confirmarAlteracoes() {
    this.confirmar.emit(this.itemEditavel);
  }
}
