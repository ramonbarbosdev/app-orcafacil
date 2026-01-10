import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from "../layout-card-config/layout-card-config";
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseService } from '../../../../services/base.service';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { CampoPersonalizadoSchema } from '../../../../schema/campopersonalizado-schema';
import { ZodError } from 'zod';
import { EventService } from '../../../../services/event.service';

import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { FlagOption } from '../../../../models/flag-option';

@Component({
  selector: 'app-config-campo-personalizado',
  imports: [LayoutCardConfig, TextareaModule, TableModule, TagModule, LayoutCampo, CommonModule, FormsModule, SelectModule, ButtonModule, InputTextModule, DividerModule],
  templateUrl: './config-campo-personalizado.html',
  styleUrl: './config-campo-personalizado.scss',
})
export class ConfigCampoPersonalizado {

  private baseService = inject(BaseService);
  loading: boolean = true;
  private endpoint = 'campopersonalizado';
  private confirmationService = inject(ConfirmationService);
  private eventService = inject(EventService);
  public errorValidacao: Record<string, string> = {};

  listaCampos: Campopersonalizado[] = [];
  campoSelecionado?: Campopersonalizado;
  listaTipoValor: FlagOption[] = [];

  objeto: Campopersonalizado = new Campopersonalizado();


  tiposCampo = [
    { label: 'Texto', value: 'TEXT' },
    { label: 'Número', value: 'NUMBER' },
    { label: 'Booleano', value: 'BOOLEAN' }
  ];

  ngOnInit() {
    this.obterTipoValor();
    this.carregarLista();
  }

  carregarLista() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {

        if (res) {

          this.listaCampos = res;
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  confirmarDelete(campo: Campopersonalizado) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir o campo "${campo.nmCampoPersonalizado}"?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deletar(campo);
      }
    });
  }

  deletar(campo: Campopersonalizado) {
    this.baseService.deleteById(`${this.endpoint}`, campo.idCampoPersonalizado)
      .subscribe({
        next: () => {

          this.carregarLista();
          this.novo();
        },
        error: err => {

        }
      });
  }

  onEdit() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {

        if (res) {

          this.objeto = res;
          this.listaCampos = res;

        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  onSelectCampo(event: any) {
    this.objeto = { ...event.data };
  }

  novo() {
    this.objeto = new Campopersonalizado();
  }

  onSave() {

    if (this.validarItens()) {
      this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto).subscribe(() => {
        this.novo();
        this.carregarLista();
        this.eventService.emitAtualizarCampoPersonalizado();

      });
    }

  }

  validarItens(): boolean {
    try {
      CampoPersonalizadoSchema.parse([this.objeto]);
      this.errorValidacao = {};
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        this.errorValidacao = {};
        error.issues.forEach((e) => {
          const value = e.path[1];
          this.errorValidacao[String(value)] = e.message;
        });
        return false;
      }
      throw error;
    }
  }

  processarNome(event: any) {

    let nome = this.formatarNome(event)

    this.objeto.cdCampoPersonalizado = nome;
  }


  obterTipoValor() {
    this.baseService.findAll(`${this.endpoint}/tipo-valor/`).subscribe({
      next: (res) => {

        this.listaTipoValor = (res as any).map((index: any) => {

          const item = new FlagOption();
          item.code = index;
          item.name = index;

          return item;
        });
      },
      error: (err) => {
      },
    });
  }


  formatarNome(nome: string) {
    const valor = nome;

    return valor
      .normalize('NFD')                     // separa acentos
      .replace(/[\u0300-\u036f]/g, '')      // remove acentos
      .replace(/[^a-zA-Z0-9\s]/g, '')       // remove caracteres especiais
      .trim()
      .replace(/\s+/g, '_')                 // espaços → _
      .toUpperCase();
  }

}
