import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from "../layout-card-config/layout-card-config";
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { Empresa } from '../../../../models/empresa';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpresaSchema } from '../../../../schema/empresa-schema';
import { ZodError } from 'zod';
import { BaseService } from '../../../../services/base.service';
import { AuthService } from '../../../../auth/auth.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-config-empresa',
  imports: [LayoutCardConfig, LayoutCampo, CommonModule, FormsModule, InputTextModule, NgxMaskDirective],
  templateUrl: './config-empresa.html',
  styleUrl: './config-empresa.scss',
})
export class ConfigEmpresa {

  public errorValidacao: Record<string, string> = {};
  public objeto: Empresa = new Empresa();
  loading: boolean = true;
  private endpoint = 'empresa';
  private baseService = inject(BaseService);



  ngAfterViewInit(): void {
    this.onEdit();
  }

  onEdit() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {

        this.objeto = res;

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


      const payload = {
        ...this.objeto,
        cdEmpresa: this.objeto.cdEmpresa.replace(/\D/g, '')
      };

      this.baseService.create(`${this.endpoint}/cadastrar`, payload).subscribe({
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
      EmpresaSchema.parse([this.objeto]);
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


  processarMascaraCpfCnpj(event: any): void {
    let valor = event.target.value || '';

    valor = valor.replace(/\D/g, '');

    if (valor.length <= 11) {
      // CPF
      valor = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      valor = valor
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.objeto.cdEmpresa = valor;
  }


}
