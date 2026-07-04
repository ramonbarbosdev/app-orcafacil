import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { BaseService } from '../../../../services/base.service';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

interface IntegracaoTenantConfig {
  habilitada?: boolean;
  configurada?: boolean;
  mensagem?: string;
}

interface WhatsappStatus {
  sucesso?: boolean;
  status?: string;
  conectado?: boolean;
  qrImagem?: string;
  telefone?: string;
  erro?: string;
}

const STATUS_TENTATIVA = new Set([
  'CONECTANDO',
  'CONNECTING',
  'AGUARDANDO_QR',
  'PENDING_QR',
]);

@Component({
  selector: 'app-config-notificacao',
  imports: [LayoutCardConfig, CommonModule, TagModule, ProgressSpinnerModule, ButtonModule, DividerModule],
  templateUrl: './config-notificacao.html',
  styleUrl: './config-notificacao.scss',
})
export class ConfigNotificacao implements OnDestroy {
  loading = true;
  whatsappCarregando = false;
  config: IntegracaoTenantConfig | null = null;
  whatsapp: WhatsappStatus | null = null;

  private readonly endpoint = 'integracao-notificacao';
  private pollingId: ReturnType<typeof setInterval> | null = null;
  private baseService = inject(BaseService);

  get qrImagemSrc(): string {
    const qr = this.whatsapp?.qrImagem;
    if (!qr) return '';
    return qr.startsWith('data:image/') ? qr : `data:image/png;base64,${qr}`;
  }

  get statusWhatsappLabel(): string {
    if (!this.whatsapp?.status) return 'Desconhecido';
    return this.whatsapp.status.replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.pararPolling();
  }

  ngAfterViewInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.baseService.findAll(`${this.endpoint}/config`).subscribe({
      next: (res: IntegracaoTenantConfig) => {
        this.config = res ?? {};
        this.loading = false;
        if (res?.habilitada) {
          this.atualizarWhatsapp();
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  atualizarWhatsapp(): void {
    if (!this.config?.habilitada) return;
    this.whatsappCarregando = true;
    this.baseService.findAll(`${this.endpoint}/whatsapp/status`).subscribe({
      next: (res: WhatsappStatus) => {
        this.whatsapp = res;
        this.whatsappCarregando = false;
        this.avaliarPolling();
      },
      error: () => {
        this.whatsappCarregando = false;
      },
    });
  }

  conectarWhatsapp(): void {
    if (this.whatsappCarregando) return;
    this.iniciarConexaoWhatsapp();
  }

  private iniciarConexaoWhatsapp(): void {
    this.whatsappCarregando = true;
    this.baseService.post(`${this.endpoint}/whatsapp/conectar`, {}).subscribe({
      next: (res: WhatsappStatus) => {
        this.whatsapp = res;
        this.whatsappCarregando = false;
        if (res?.erro) {
          this.pararPolling();
          return;
        }
        this.iniciarPolling();
      },
      error: () => {
        this.whatsappCarregando = false;
      },
    });
  }

  desconectarWhatsapp(): void {
    this.executarAcao('desconectar');
  }

  conectarOutroWhatsapp(): void {
    if (this.whatsappCarregando) return;

    if (this.whatsapp?.conectado) {
      this.whatsappCarregando = true;
      this.baseService.post(`${this.endpoint}/whatsapp/desconectar`, {}).subscribe({
        next: () => {
          this.iniciarConexaoWhatsapp();
        },
        error: () => {
          this.whatsappCarregando = false;
        },
      });
      return;
    }

    this.conectarWhatsapp();
  }

  cancelarConexaoWhatsapp(): void {
    this.executarAcao('cancelar-conexao');
  }

  private executarAcao(acao: 'desconectar' | 'cancelar-conexao'): void {
    this.whatsappCarregando = true;
    this.baseService.post(`${this.endpoint}/whatsapp/${acao}`, {}).subscribe({
      next: (res: WhatsappStatus) => {
        this.whatsapp = res;
        this.whatsappCarregando = false;
        this.pararPolling();
      },
      error: () => {
        this.whatsappCarregando = false;
      },
    });
  }

  private iniciarPolling(): void {
    this.pararPolling();
    this.pollingId = setInterval(() => this.atualizarWhatsappSilencioso(), 4000);
  }

  private atualizarWhatsappSilencioso(): void {
    this.baseService.findAll(`${this.endpoint}/whatsapp/status`).subscribe({
      next: (res: WhatsappStatus) => {
        this.whatsapp = res;
        this.avaliarPolling();
      },
    });
  }

  private avaliarPolling(): void {
    const status = this.whatsapp?.status;
    if (this.whatsapp?.conectado || !status || !STATUS_TENTATIVA.has(status)) {
      this.pararPolling();
    } else if (!this.pollingId) {
      this.iniciarPolling();
    }
  }

  private pararPolling(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }
}
