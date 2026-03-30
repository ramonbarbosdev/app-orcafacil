import { Component, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BaseService } from '../../../../services/base.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { Divider, DividerModule } from 'primeng/divider';
import { Campopersonalizado } from '../../../../models/campopersonalizado';


@Component({
  selector: 'app-catalogocampoform',
  imports: [CheckboxModule, CommonModule, FormsModule, DividerModule],
  templateUrl: './catalogocampoform.html',
  styleUrl: './catalogocampoform.scss',
})
export class Catalogocampoform {

  @Input() carregarDados = false;
  @Output() valorPreco = new EventEmitter<number>();

  private baseService = inject(BaseService);
  private wizardState = inject(CatalogoWizardStateService);

  camposPrecificacao: Campopersonalizado[] = [];
  totalSelecionados = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.carregarDados) {
      this.obterCampos();
    }
  }

  toggleCampo(campo: any) {
    campo.ativo = !campo.ativo;
    this.onToggleCampo(campo);
  }
  get camposSelecionados() {
    return this.camposPrecificacao?.filter(c => c.ativo) ?? [];
  }

  obterCampos() {
    this.baseService.findAll('campopersonalizado/obter-por-tenant')
      .subscribe(res => {

        const selecionados = this.wizardState.getCamposSelecionadosSnapshot();

        this.camposPrecificacao = res.map((campo: any) => ({
          ...campo,
          ativo: selecionados.some(
            s => s.idCampoPersonalizado === campo.idCampoPersonalizado
          ),
        }));
      });
  }

  continuar() {
    const selecionados = this.camposPrecificacao
      .filter(c => c.ativo)
      .map(c => ({ ...c }));

    this.wizardState.setCamposSelecionados(selecionados);
  }

  onToggleCampo(campo: any) {

    const ajustes = this.wizardState.getAjustesPadraoSnapshot();

    if (!campo.ativo) {
      const novo = { ...ajustes };
      delete novo[campo.idCampoPersonalizado];
      this.wizardState.hidratar(
        this.wizardState.getCamposSelecionadosSnapshot(),
        novo
      );
    } else {
      this.wizardState.setAjustePadrao(campo.idCampoPersonalizado, {
        valor: 0,
        descricao: ''
      });
    }

    const total = Object.values(this.wizardState.getAjustesPadraoSnapshot())
      .map(v => Number(v?.valor))
      .reduce((soma, v) => soma + v, 0);

    this.valorPreco.emit(total);

    this.totalSelecionados =
      this.camposPrecificacao.filter(c => c.ativo).length;
  }


}
