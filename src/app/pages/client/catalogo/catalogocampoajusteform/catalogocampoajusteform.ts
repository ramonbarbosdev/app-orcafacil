import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { combineLatest, Subscription } from 'rxjs';
import { EventService } from '../../../../services/event.service';
import { Campopersonalizado } from '../../../../models/campopersonalizado';

@Component({
  selector: 'app-catalogocampoajusteform',
  imports: [CommonModule,
    FormsModule,
    InputNumberModule,
    InputTextModule],
  templateUrl: './catalogocampoajusteform.html',
  styleUrl: './catalogocampoajusteform.scss',
})
export class Catalogocampoajusteform {

  private wizardState = inject(CatalogoWizardStateService);

  camposAtivos: Campopersonalizado[] = [];
  uiValores: Record<number, any> = {};
  @Input() objeto: any;
  @Input() carregarDados = false;

  private sub = new Subscription();
  private eventService = inject(EventService);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.carregarDados && changes['objeto']) {

    }
  }

  totalAtual = 0;
  valoresAnteriores: Record<number, number> = {};


  ngOnInit() {
    this.limpar()

    this.processar();

    this.eventService.atualizarCampoPersonalizado$.subscribe(() => {
      this.processar();
    });

  }

  processar() {

    this.sub.add(
      combineLatest([
        this.wizardState.camposSelecionados$,
        this.wizardState.ajustesPadrao$
      ]).subscribe(([campos, ajustes]) => {

        this.camposAtivos = campos;

        this.uiValores = {
          ...this.uiValores,
          ...ajustes
        };

        this.totalAtual = Object.values(this.uiValores)
          .map(v => Number(v))
          .filter(v => !isNaN(v))
          .reduce((soma, v) => soma + v, 0);

        this.valoresAnteriores = { ...this.uiValores };

        if (this.objeto == null) {
          this.objeto.vlPrecoBase = this.totalAtual;
        }

      })
    );
  }

  public setValor(idCampo: number, valor: any) {

    const novoValor = Number(valor) || 0;
    const valorAnterior = this.valoresAnteriores[idCampo] ?? 0;

    this.totalAtual = this.totalAtual - valorAnterior + novoValor;
    this.valoresAnteriores[idCampo] = novoValor;

    this.objeto.vlPrecoBase = this.totalAtual;
    this.uiValores[idCampo] = valor;
    this.wizardState.setAjustePadrao(idCampo, novoValor);

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  trackByCampo(index: number, campo: Campopersonalizado): number {
    return campo.idCampoPersonalizado;
  }

  limpar() {
    this.wizardState.reset();
    this.uiValores = []
  }



}
