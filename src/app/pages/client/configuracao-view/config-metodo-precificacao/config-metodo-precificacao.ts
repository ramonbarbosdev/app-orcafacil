import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetodoPrecificacao } from '../../../../models/metodo-precificacao';
import { SelectModule } from 'primeng/select';
import { BaseService } from '../../../../services/base.service';
import { FlagOption } from '../../../../models/flag-option';
import { EmpresaMetodoPrecificacao } from '../../../../models/empresa-metodo-precificacao';
import { ZodError } from 'zod';
import { EmpresaMetodoPrecificacaoSchema } from '../../../../schema/empresametodoprecificacao-schema';

@Component({
  selector: 'app-config-metodo-precificacao',
  imports: [LayoutCardConfig, CommonModule, FormsModule, SelectModule, LayoutCampo],
  templateUrl: './config-metodo-precificacao.html',
  styleUrl: './config-metodo-precificacao.scss',
})
export class ConfigMetodoPrecificacao {
  public errorValidacao: Record<string, string> = {};
  public objeto: EmpresaMetodoPrecificacao = new EmpresaMetodoPrecificacao();
  loading: boolean = true;
  private endpoint = 'empresametodoprecificacao';
  private baseService = inject(BaseService);
  public listaMetodo: FlagOption[] = [];

  ngAfterViewInit(): void {
    this.obterMetodo()
    this.onEdit();
  }

  onEdit() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {
        if (res) {
          this.objeto = res;
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  onSave() {

    if (this.validarItens()) {

      this.loading = true;

      this.baseService.create(`${this.endpoint}/`, this.objeto).subscribe({
        next: () => {
          this.loading = false;

        },
        error: (erro) => {
          this.loading = false;
        },
      });
    }

  }

  validarItens(): boolean {
    try {
      EmpresaMetodoPrecificacaoSchema.parse([this.objeto]);
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


  obterMetodo() {
    this.baseService.findAll(`metodoprecificacao/`).subscribe({
      next: (res) => {
        this.listaMetodo = (res as any).map((index: any) => {
          const item = new FlagOption();
          item.code = index.idMetodoPrecificacao;
          item.name = index.nmMetodoPrecificacao;
          return item;
        });
      },
      error: (err) => { },
    });
  }

}
