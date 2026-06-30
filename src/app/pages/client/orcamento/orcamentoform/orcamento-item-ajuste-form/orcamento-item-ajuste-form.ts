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
import { SelectCadastroRapido } from '../../../../../components/select-cadastro-rapido/select-cadastro-rapido';

@Component({
  selector: 'app-orcamento-item-ajuste-form',
  imports: [DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputNumberModule, LayoutCampo, DividerModule, InputTextModule, SelectCadastroRapido],
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

    this.baseService.findAll('campos-personalizados').subscribe({
      next: (res) => {
        this.atualizarListaCampos(this.mapearCampos(res as any[]));
        this.cd.markForCheck();
      },
      error: () => {
        this.cd.markForCheck();
      },
    });
  }

  atualizarListaCampos(opcoes: FlagOption[]) {
    this.listaCampos = opcoes.map((c) => {
      const item = new FlagOption();
      item.code = c.code;
      item.name = c.name;
      item.extra = c.extra ?? {
        tpCampoValor: (c as any).tpCampoValor,
      };
      return item;
    });
  }

  private mapearCampos(res: any[]): FlagOption[] {
    return res.map((index) => {
      const item = new FlagOption();
      item.code = index.idCampoPersonalizado;
      item.name = index.nmCampoPersonalizado;
      item.extra = {
        tpCampoValor: index.tpCampoValor,
      };
      return item;
    });
  }

  confirmarAlteracoes() {
    this.confirmar.emit(this.itemEditavel);
  }
}
