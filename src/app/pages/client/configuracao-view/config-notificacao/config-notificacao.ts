import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import { BaseService } from '../../../../services/base.service';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface IntegracaoStatus {
  habilitada: boolean;
  conectada: boolean;
  mensagem?: string;
  apiKeyValida?: boolean;
  whatsappConectado?: boolean;
  whatsappStatus?: string;
  whatsappTelefone?: string;
  usaApiKeyTenant?: boolean;
}

interface IntegracaoConfig {
  idOrganizacaoOrcafacil?: number;
  idOrganizacaoNotificacao?: number;
  apiKeyMascarada?: string;
  usaApiKeyTenant?: boolean;
  usaApiKeyGlobal?: boolean;
}

@Component({
  selector: 'app-config-notificacao',
  imports: [
    LayoutCardConfig,
    CommonModule,
    FormsModule,
    DividerModule,
    InputTextModule,
    TagModule,
    ProgressSpinnerModule,
    LayoutCampo,
  ],
  templateUrl: './config-notificacao.html',
  styleUrl: './config-notificacao.scss',
})
export class ConfigNotificacao {
  loading = true;
  verificandoStatus = false;
  status: IntegracaoStatus | null = null;
  config: IntegracaoConfig = {};
  idOrganizacaoNotificacao?: number;
  apiKey = '';

  private readonly endpoint = 'integracao-notificacao';
  private baseService = inject(BaseService);

  ngAfterViewInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.baseService.findAll(`${this.endpoint}/config`).subscribe({
      next: (res: IntegracaoConfig) => {
        this.config = res ?? {};
        this.idOrganizacaoNotificacao = res?.idOrganizacaoNotificacao;
        this.loading = false;
        this.verificarStatus();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  verificarStatus(): void {
    this.verificandoStatus = true;
    this.baseService.findAll(`${this.endpoint}/status`).subscribe({
      next: (res: IntegracaoStatus) => {
        this.status = res;
        this.verificandoStatus = false;
      },
      error: () => {
        this.verificandoStatus = false;
      },
    });
  }

  onSave(): void {
    this.loading = true;
    const payload: Record<string, unknown> = {
      idOrganizacaoNotificacao: this.idOrganizacaoNotificacao,
    };
    if (this.apiKey?.trim()) {
      payload['apiKey'] = this.apiKey.trim();
    }

    this.baseService.update(`${this.endpoint}/config`, payload).subscribe({
      next: (res: IntegracaoConfig) => {
        this.config = res ?? {};
        this.idOrganizacaoNotificacao = res?.idOrganizacaoNotificacao;
        this.apiKey = '';
        this.loading = false;
        this.verificarStatus();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
