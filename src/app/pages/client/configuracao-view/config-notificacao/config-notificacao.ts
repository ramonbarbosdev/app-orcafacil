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
import { MessageService } from 'primeng/api';

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
  apiKey?: string;
  configurada?: boolean;
  emailAlertas?: string;
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
  apiKey = '';
  emailAlertas = '';

  private readonly endpoint = 'integracao-notificacao';
  private baseService = inject(BaseService);
  private messageService = inject(MessageService);

  ngAfterViewInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.baseService.findAll(`${this.endpoint}/config`).subscribe({
      next: (res: IntegracaoConfig) => {
        this.config = res ?? {};
        this.apiKey = res?.apiKey ?? '';
        this.emailAlertas = res?.emailAlertas ?? '';
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
    const chave = this.apiKey?.trim();
    if (!chave && !this.config.configurada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'API Key obrigatória',
        detail: 'Informe a API Key completa (nak_prefixo.segredo) para ativar a integração.',
        life: 6000,
      });
      return;
    }

    this.loading = true;
    const payload: Record<string, unknown> = {};
    if (chave) {
      payload['apiKey'] = chave;
    }
    payload['emailAlertas'] = this.emailAlertas?.trim() || null;

    this.baseService.update(`${this.endpoint}/config`, payload).subscribe({
      next: (res: IntegracaoConfig) => {
        this.config = res ?? {};
        this.apiKey = res?.apiKey ?? chave ?? '';
        this.emailAlertas = res?.emailAlertas ?? this.emailAlertas ?? '';
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Integração salva',
          detail: 'API Key configurada para esta organização.',
          life: 5000,
        });
        this.verificarStatus();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
