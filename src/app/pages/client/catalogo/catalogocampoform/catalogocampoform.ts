import { Component, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BaseService } from '../../../../services/base.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoWizardStateService } from '../../../../services/catalogo-wizard-state.service';
import { Divider, DividerModule } from 'primeng/divider';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { Subscription } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';


@Component({
  selector: 'app-catalogocampoform',
  imports: [CheckboxModule, CommonModule, FormsModule, DividerModule, InputTextModule, PaginatorModule],
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
  termoBusca = '';
  first = 0;
  rows = 9;
  rowsPerPageOptions = [6, 9, 12, 18];
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.wizardState.camposSelecionados$.subscribe(selecionados => {
        this.aplicarSelecionados(selecionados);
      })
    );
  }

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

  get camposFiltrados() {
    const termo = this.normalizar(this.termoBusca);

    if (!termo) {
      return this.camposPrecificacao;
    }

    return this.camposPrecificacao.filter(campo => {
      const texto = this.normalizar([
        campo.nmCampoPersonalizado,
        campo.dsCampoPersonalizado,
        campo.cdCampoPersonalizado,
        campo.tpCampoPersonalizado,
        campo.tpCampoValor
      ].filter(Boolean).join(' '));

      return texto.includes(termo);
    });
  }

  get camposPaginados() {
    return this.camposFiltrados.slice(this.first, this.first + this.rows);
  }

  obterCampos() {
    this.baseService.findAll('campos-personalizados')
      .subscribe(res => {

        const selecionados = this.wizardState.getCamposSelecionadosSnapshot();

        this.camposPrecificacao = (res as any[]).map((campo: any) => ({
          ...campo,
          ativo: false,
        }));

        this.aplicarSelecionados(selecionados);
      });
  }

  continuar() {
    const selecionados = this.camposPrecificacao
      .filter(c => c.ativo)
      .map(c => ({ ...c }));

    this.wizardState.setCamposSelecionados(selecionados);
  }

  onToggleCampo(campo: any) {

    const selecionados = this.camposPrecificacao
      .filter(c => c.ativo)
      .map(c => ({ ...c }));

    this.wizardState.setCamposSelecionados(selecionados);

    if (campo.ativo) {
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

  onBuscar(): void {
    this.first = 0;
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  private aplicarSelecionados(selecionados: Campopersonalizado[]): void {
    if (!this.camposPrecificacao.length) {
      this.totalSelecionados = selecionados.length;
      return;
    }

    const idsSelecionados = new Set(
      selecionados.map(c => c.idCampoPersonalizado)
    );

    this.camposPrecificacao = this.camposPrecificacao.map(campo => ({
      ...campo,
      ativo: idsSelecionados.has(campo.idCampoPersonalizado)
    }));

    this.totalSelecionados =
      this.camposPrecificacao.filter(c => c.ativo).length;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private normalizar(valor: string): string {
    return String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }


}
