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
  camposPrecificacao: Campopersonalizado[] = [
  ];

  totalSelecionados = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.limpar()
    if (this.carregarDados) {
      this.obterCampos();
    }
  }

  ngOnInit() {
  }

  obterCampos() {
    this.baseService.findAll('campopersonalizado/obter-por-tenant').subscribe(res => {
      const selecionados = this.wizardState.getCamposSelecionadosSnapshot();

      this.camposPrecificacao = res.map((campo: any) => ({
        idCampoPersonalizado: campo.idCampoPersonalizado,
        nmCampoPersonalizado: campo.nmCampoPersonalizado,
        tpCampoPersonalizado: campo.tpCampoPersonalizado,
        tpCampoValor: campo.tpCampoValor,
        dsCampoPersonalizado: campo.dsCampoPersonalizado,
        ativo: selecionados.some(
          s => s.idCampoPersonalizado === campo.idCampoPersonalizado
        ),
      }));
    });
  }

  continuar() {
    const selecionados = this.camposPrecificacao
      .filter(c => c.ativo)
      .map(c => ({
        idCampoPersonalizado: c.idCampoPersonalizado,
        nmCampoPersonalizado: c.nmCampoPersonalizado,
        tpCampoPersonalizado: c.tpCampoPersonalizado,
        tpCampoValor: c.tpCampoValor,
        dsCampoPersonalizado: c.dsCampoPersonalizado,
      }));

    const atuais = this.wizardState.getCamposSelecionadosSnapshot();

    if (!this.saoIguais(atuais, selecionados)) {
      this.wizardState.setCamposSelecionados(selecionados);
    }
  }

  private saoIguais(
    a: any[],
    b: any[]
  ): boolean {

    if (a.length !== b.length) return false;

    return a.every((campo, i) =>
      campo.idCampoPersonalizado === b[i].idCampoPersonalizado &&
      campo.tpCampoPersonalizado === b[i].tpCampoPersonalizado
    );
  }



  onToggleCampo(campo?: any) {

    const ajustes = this.wizardState.getAjustesPadraoSnapshot();
    const valorCampo = Number(ajustes[campo.idCampoPersonalizado] ?? 0);

    if (!campo.ativo) {
      delete ajustes[campo.idCampoPersonalizado];
    } else {
      ajustes[campo.idCampoPersonalizado] ??= 0;
    }

    const total = Object.values(ajustes)
      .map(v => Number(v))
      .filter(v => !isNaN(v))
      .reduce((soma, v) => soma + v, 0);

    this.wizardState.setAjustePadrao(campo.idCampoPersonalizado, 0);
    this.valorPreco.emit(total);

    this.totalSelecionados =
      this.camposPrecificacao.filter(c => c.ativo).length;
  }


  limpar() {
    this.wizardState.reset();
    this.camposPrecificacao = []
  }


}
