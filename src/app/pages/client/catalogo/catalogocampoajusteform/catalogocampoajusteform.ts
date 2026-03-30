import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { AjusteCampo, CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { combineLatest, Subscription } from 'rxjs';
import { EventService } from '../../../../services/event.service';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-catalogocampoajusteform',
  imports: [CommonModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule],
  templateUrl: './catalogocampoajusteform.html',
  styleUrl: './catalogocampoajusteform.scss',
})
export class Catalogocampoajusteform {

  @Input() objeto: any;
  @Input() carregarDados = false;

  private wizardState = inject(CatalogoWizardStateService);

  camposAtivos: Campopersonalizado[] = [];
  uiValores: Record<number, AjusteCampo> = {};

  totalAtual = 0;
  private sub = new Subscription();
  private eventService = inject(EventService);

  ngOnInit() {
    this.limpar()

    this.processar();

    this.eventService.atualizarCampoPersonalizado$.subscribe(() => {
      this.processar();
    });
  }

  setValor(idCampo: number, valor: any) {
    const novoValor = Number(valor) || 0;
    const descricao = this.uiValores[idCampo]?.descricao ?? '';

    this.uiValores[idCampo] = {
      valor: novoValor,
      descricao
    };

    this.wizardState.setAjustePadrao(idCampo, {
      valor: novoValor,
      descricao
    });

    this.objeto.vlPrecoBase = this.totalAtual;
  }

  setDescricao(idCampo: number, descricao: string) {
    const valor = this.uiValores[idCampo]?.valor ?? 0;

    this.uiValores[idCampo] = {
      valor,
      descricao
    };

    this.wizardState.setAjustePadrao(idCampo, {
      valor,
      descricao
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  processar() {
    this.sub.add(
      combineLatest([
        this.wizardState.camposSelecionados$,
        this.wizardState.ajustesPadrao$
      ]).subscribe(([campos, ajustes]) => {

        this.camposAtivos = campos;

        this.uiValores = { ...ajustes };
        
        this.totalAtual = Object.values(this.uiValores)
          .map(v => Number(v?.valor))
          .reduce((soma, v) => soma + v, 0);
      })
    );
  }


  limpar() {
    this.wizardState.reset();
    this.uiValores = []
  }


}
