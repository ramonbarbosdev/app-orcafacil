import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { BaseService } from '../../../../services/base.service';
import { ZodError } from 'zod';
import { EmpresaMetodoPrecificacaoSchema } from '../../../../schema/empresametodoprecificacao-schema';
import { InputNumberModule } from 'primeng/inputnumber';
import { EmpresaMetodoPrecificacao } from '../../../../models/empresa-metodo-precificacao';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';

export interface CampoMetodoDTO {
  nome: string;
  label: string;
  tipo: 'NUMBER' | 'TEXT' | 'BOOLEAN';
  obrigatorio: boolean;
}

export interface MetodoPrecificacaoMetaDTO {
  idMetodoPrecificacao: number;
  cdMetodoPrecificacao: string;
  nmMetodoPrecificacao: string;
  dsMetodoPrecificacao: string;
  campos: CampoMetodoDTO[];
}

@Component({
  selector: 'app-config-metodo-precificacao',
  imports: [LayoutCardConfig, CommonModule, FormsModule, SelectModule, LayoutCampo, InputNumberModule, ToggleSwitchModule, InputTextModule],
  templateUrl: './config-metodo-precificacao.html',
  styleUrl: './config-metodo-precificacao.scss',
})
export class ConfigMetodoPrecificacao {
  public errorValidacao: Record<string, string> = {};
  public objeto: EmpresaMetodoPrecificacao = new EmpresaMetodoPrecificacao();
  loading: boolean = true;
  private endpoint = 'empresametodoprecificacao';
  private baseService = inject(BaseService);
  public listaMetodo: MetodoPrecificacaoMetaDTO[] = [];
  public camposMetodo: CampoMetodoDTO[] = [];

  ngAfterViewInit(): void {
    this.obterMetodo()
    this.onEdit();
  }

  onEdit() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {
        if (res) {
          this.objeto = res;

          if (this.listaMetodo.length) {
            this.processarMetodo(false);
          }
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

  processarMetodo(limparConfig: boolean = true) {
    const metodo = this.listaMetodo.find(
      m => m.idMetodoPrecificacao === this.objeto.idMetodoPrecificacao
    );

    this.camposMetodo = metodo?.campos ?? [];
    if (limparConfig) {
      this.objeto.configuracao = {};
    } else {
      this.objeto.configuracao = this.objeto.configuracao ?? {};
    }
  }

  obterMetodo() {
    this.baseService.findAll(`metodoprecificacao/buscar`).subscribe({
      next: (res: any) => {
        this.listaMetodo = res as MetodoPrecificacaoMetaDTO[];
      },
      error: () => { }
    });
  }




}
