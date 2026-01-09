import { Component, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { BaseService } from '../../../../services/base.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { Divider, DividerModule } from 'primeng/divider';
import { Catalogocampoajusteform } from '../catalogocampoajusteform/catalogocampoajusteform';
import { EventService } from '../../../../services/event.service';

export interface CampoPrecificacaoDTO {
  idCampoPersonalizado: number;
  nmCampoPersonalizado: string;
  tpCampoPersonalizado: string;
  ativo: boolean;
}


@Component({
  selector: 'app-catalogocampoform',
  imports: [CheckboxModule, CommonModule, FormsModule, DividerModule],
  templateUrl: './catalogocampoform.html',
  styleUrl: './catalogocampoform.scss',
})
export class Catalogocampoform {

  @Input() carregarDados = false;

  private baseService = inject(BaseService);
  private wizardState = inject(CatalogoWizardStateService);
  camposPrecificacao: CampoPrecificacaoDTO[] = [
  ];

  totalSelecionados = 0;
  private eventService = inject(EventService);

  @ViewChild('Catalogocampoajusteform')
  camposForm!: Catalogocampoajusteform;


  ngOnChanges(changes: SimpleChanges): void {
    this.limpar()
    if (this.carregarDados) {
      this.obterCampos();
    }
  }

  ngOnInit() {
    // this.obterCampos();
  }

  obterCampos() {
    this.baseService.findAll('campopersonalizado/obter-por-tenant').subscribe(res => {
      const selecionados = this.wizardState.getCamposSelecionadosSnapshot();

      this.camposPrecificacao = res.map((campo: any) => ({
        idCampoPersonalizado: campo.idCampoPersonalizado,
        nmCampoPersonalizado: campo.nmCampoPersonalizado,
        tpCampoPersonalizado: campo.tpCampoPersonalizado,
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
 

    this.totalSelecionados =
      this.camposPrecificacao.filter(c => c.ativo).length;
  }


  limpar() {
    this.wizardState.reset();
    this.camposPrecificacao = []
  }


}
