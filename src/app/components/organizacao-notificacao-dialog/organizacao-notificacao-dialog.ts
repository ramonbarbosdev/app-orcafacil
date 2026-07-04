import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { BaseService } from '../../services/base.service';

interface NotificacaoAdminConfig {
  idOrganizacaoOrcafacil?: number;
  idOrganizacaoNotificacao?: number;
  apiKey?: string;
  configurada?: boolean;
  habilitada?: boolean;
  emailAlertas?: string;
}

interface IntegracaoStatus {
  conectada?: boolean;
  apiKeyValida?: boolean;
  whatsappConectado?: boolean;
  whatsappStatus?: string;
  whatsappTelefone?: string;
  mensagem?: string;
}

@Component({
  selector: 'app-organizacao-notificacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    TagModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './organizacao-notificacao-dialog.html',
})
export class OrganizacaoNotificacaoDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() idOrganizacao = 0;
  @Input() nmOrganizacao = '';

  loading = false;
  saving = false;
  verificandoStatus = false;

  config: NotificacaoAdminConfig = {};
  apiKey = '';
  emailAlertas = '';
  habilitada = false;
  idOrganizacaoNotificacao?: number;

  status: IntegracaoStatus | null = null;

  private baseService = inject(BaseService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    return `Notificações${this.nmOrganizacao ? ' — ' + this.nmOrganizacao : ''}`;
  }

  get endpointBase(): string {
    return `admin/organizacoes/${this.idOrganizacao}/notificacao`;
  }

  onShow(): void {
    if (!this.idOrganizacao) return;
    this.carregarConfig();
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  carregarConfig(): void {
    this.loading = true;
    this.baseService.findAll(`${this.endpointBase}/config`).subscribe({
      next: (res: NotificacaoAdminConfig) => {
        this.config = res ?? {};
        this.apiKey = res?.apiKey ?? '';
        this.emailAlertas = res?.emailAlertas ?? '';
        this.habilitada = !!res?.habilitada;
        this.idOrganizacaoNotificacao = res?.idOrganizacaoNotificacao;
        this.loading = false;
        this.verificarStatus();
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  salvarConfig(): void {
    this.saving = true;
    const payload: Record<string, unknown> = {
      habilitada: this.habilitada,
      emailAlertas: this.emailAlertas?.trim() || null,
    };
    if (this.idOrganizacaoNotificacao != null) {
      payload['idOrganizacaoNotificacao'] = this.idOrganizacaoNotificacao;
    }
    const chave = this.apiKey?.trim();
    if (chave) {
      payload['apiKey'] = chave;
    }

    this.baseService.update(`${this.endpointBase}/config`, payload).subscribe({
      next: (res: NotificacaoAdminConfig) => {
        this.config = res ?? {};
        this.apiKey = res?.apiKey ?? chave ?? '';
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Configuração salva',
          life: 4000,
        });
        this.verificarStatus();
        this.cd.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.cd.markForCheck();
      },
    });
  }

  verificarStatus(): void {
    this.verificandoStatus = true;
    this.baseService.findAll(`${this.endpointBase}/status`).subscribe({
      next: (res: IntegracaoStatus) => {
        this.status = res;
        this.verificandoStatus = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.verificandoStatus = false;
        this.cd.markForCheck();
      },
    });
  }
}
