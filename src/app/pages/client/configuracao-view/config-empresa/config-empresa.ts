import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { Empresa } from '../../../../models/empresa';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpresaSchema } from '../../../../schema/empresa-schema';
import { ZodError } from 'zod';
import { BaseService } from '../../../../services/base.service';
import { NgxMaskDirective } from 'ngx-mask';
import { FormatCpfCnpj } from '../../../../format/FormatarCpfCnpj';

@Component({
  selector: 'app-config-empresa',
  imports: [LayoutCardConfig, LayoutCampo, CommonModule, FormsModule, InputTextModule, NgxMaskDirective],
  templateUrl: './config-empresa.html',
  styleUrl: './config-empresa.scss',
})
export class ConfigEmpresa {
  public errorValidacao: Record<string, string> = {};
  public objeto: Empresa = new Empresa();
  loading = true;
  private readonly endpoint = 'configuracao-orcamento/empresa';
  private baseService = inject(BaseService);

  ngAfterViewInit(): void {
    this.onEdit();
  }

  onEdit(): void {
    this.baseService.findAll(this.endpoint).subscribe({
      next: (res: Empresa) => {
        this.objeto = { ...new Empresa(), ...res };
        this.objeto.cdEmpresa = FormatCpfCnpj(this.objeto.cdEmpresa ?? '');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSave(): void {
    if (!this.validarItens()) {
      return;
    }
    this.loading = true;

    const payload = {
      cdEmpresa: this.objeto.cdEmpresa.replace(/\D/g, ''),
      nmEmpresa: this.objeto.nmEmpresa,
      dsEmail: this.objeto.dsEmail,
      nuTelefone: this.objeto.nuTelefone,
    };

    this.baseService.update(this.endpoint, payload).subscribe({
      next: (res: Empresa) => {
        this.objeto = { ...this.objeto, ...res };
        this.objeto.cdEmpresa = FormatCpfCnpj(this.objeto.cdEmpresa ?? '');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
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

  processarMascaraCpfCnpj(event: Event): void {
    const target = event.target as HTMLInputElement;
    let valor = target.value || '';
    valor = valor.replace(/\D/g, '');
    this.objeto.cdEmpresa = FormatCpfCnpj(valor);
  }
}
