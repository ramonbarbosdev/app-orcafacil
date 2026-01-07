import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { BaseService } from '../../../../services/base.service';
import { ConfiguracaoOrcamento } from '../../../../models/configuracao-orcamento';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-config-orcamento',
  imports: [LayoutCardConfig, LayoutCampo, CommonModule, FormsModule,TextareaModule, InputTextModule,InputNumberModule],
  templateUrl: './config-orcamento.html',
  styleUrl: './config-orcamento.scss',
})
export class ConfigOrcamento {

  public errorValidacao: Record<string, string> = {};
  public objeto: ConfiguracaoOrcamento = new ConfiguracaoOrcamento();
  loading: boolean = true;
  private endpoint = 'configuracaoorcamento';
  private baseService = inject(BaseService);

  ngAfterViewInit(): void {
    this.onEdit();
  }

  onEdit() {
    this.baseService.findAll(`${this.endpoint}/`).subscribe({
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
