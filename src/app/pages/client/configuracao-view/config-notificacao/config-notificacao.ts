import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { BaseService } from '../../../../services/base.service';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import {
  ehStatusDeTentativa,
  labelWhatsappStatus,
  resolverMensagemExibicao,
} from '../../../../shared/notificacao.labels';
import {
  aguardandoQrCode,
  montarQrImagemSrc,
  obterQrBruto,
} from '../../../../shared/whatsapp.helpers';

interface IntegracaoTenantConfig {
  habilitada?: boolean;
  configurada?: boolean;
  mensagem?: string;
}

interface WhatsappStatus {
  sucesso?: boolean;
  status?: string;
  conectado?: boolean;
  qr?: string;
  qrImagem?: string;
  telefone?: string;
  erro?: string;
}

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
  private refreshQrTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private baseService = inject(BaseService);

  get qrImagemSrc(): string {
    return montarQrImagemSrc(this.whatsapp);
  }

  get aguardandoQr(): boolean {
    return aguardandoQrCode(this.whatsapp);
  }

  get statusWhatsappLabel(): string {
    return labelWhatsappStatus(this.whatsapp?.status);
  }

  get whatsappErroLabel(): string {
    return resolverMensagemExibicao(this.whatsapp?.erro, this.whatsapp?.erro);
  }

  ngOnDestroy(): void {
    this.pararPolling();
    this.cancelarRefreshQr();
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
        this.aplicarRespostaWhatsapp(res);
        this.whatsappCarregando = false;
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
        this.aplicarRespostaWhatsapp(res);
        this.whatsappCarregando = false;
        if (res?.erro && !ehStatusDeTentativa(res.status)) {
          this.pararPolling();
        }
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
        this.aplicarRespostaWhatsapp(res);
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
    this.pollingId = setInterval(() => this.atualizarWhatsappSilencioso(), 2000);
  }

  private atualizarWhatsappSilencioso(): void {
    this.baseService.findAll(`${this.endpoint}/whatsapp/status`).subscribe({
      next: (res: WhatsappStatus) => this.aplicarRespostaWhatsapp(res),
    });
  }

  private aplicarRespostaWhatsapp(res: WhatsappStatus): void {
    this.whatsapp = res;
    this.avaliarPolling();

    if (ehStatusDeTentativa(res.status) && !obterQrBruto(res)) {
      this.agendarRefreshQrRapido();
    } else {
      this.cancelarRefreshQr();
    }
  }

  private agendarRefreshQrRapido(): void {
    if (this.refreshQrTimeoutId) return;
    this.refreshQrTimeoutId = setTimeout(() => {
      this.refreshQrTimeoutId = null;
      if (aguardandoQrCode(this.whatsapp)) {
        this.atualizarWhatsappSilencioso();
      }
    }, 1200);
  }

  private cancelarRefreshQr(): void {
    if (this.refreshQrTimeoutId) {
      clearTimeout(this.refreshQrTimeoutId);
      this.refreshQrTimeoutId = null;
    }
  }

  private avaliarPolling(): void {
    const status = this.whatsapp?.status;
    if (this.whatsapp?.conectado || !status || !ehStatusDeTentativa(status)) {
      this.pararPolling();
    } else if (!this.pollingId) {
      this.iniciarPolling();
    }
  }

  private pararPolling(): void {
    this.cancelarRefreshQr();
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }
}
