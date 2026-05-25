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
import { startWith } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
@Component({
  selector: 'app-catalogocampoajusteform',
  imports: [CommonModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    PaginatorModule],
  templateUrl: './catalogocampoajusteform.html',
  styleUrl: './catalogocampoajusteform.scss',
})
export class Catalogocampoajusteform {

  @Input() objeto: any;
  @Input() carregarDados = false;

  private wizardState = inject(CatalogoWizardStateService);

  camposAtivos: Campopersonalizado[] = [];
  uiValores: Record<number, AjusteCampo> = {};
  termoBusca = '';
  first = 0;
  rows = 5;
  rowsPerPageOptions = [5, 10, 15, 20];

  totalAtual = 0;
  private sub = new Subscription();
  private eventService = inject(EventService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.sub.add(
      combineLatest([
        this.wizardState.camposSelecionados$,
        this.wizardState.ajustesPadrao$,
        this.eventService.atualizarCampoPersonalizado$.pipe(startWith(null))
      ]).subscribe(([campos, ajustes]) => {

        this.camposAtivos = campos;
        this.uiValores = { ...ajustes };

        this.totalAtual = Object.values(this.uiValores)
          .map(v => Number(v?.valor) || 0)
          .reduce((soma, v) => soma + v, 0);

        if (this.objeto) {
          this.objeto.vlPrecoBase = this.totalAtual;
        }

        this.cd.detectChanges();
      })
    );
  }

  get camposFiltrados() {
    const termo = this.normalizar(this.termoBusca);

    if (!termo) {
      return this.camposAtivos;
    }

    return this.camposAtivos.filter(campo => {
      const texto = this.normalizar([
        campo.nmCampoPersonalizado,
        campo.dsCampoPersonalizado,
        campo.cdCampoPersonalizado,
        campo.tpCampoPersonalizado,
        campo.tpCampoValor,
        this.uiValores[campo.idCampoPersonalizado]?.descricao
      ].filter(Boolean).join(' '));

      return texto.includes(termo);
    });
  }

  get camposPaginados() {
    return this.camposFiltrados.slice(this.first, this.first + this.rows);
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

  onBuscar(): void {
    this.first = 0;
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  private normalizar(valor: string): string {
    return String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }


}
