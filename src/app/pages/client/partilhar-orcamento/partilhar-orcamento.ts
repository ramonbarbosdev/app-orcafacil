import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseService } from '../../../services/base.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

type NotificacaoCanal = 'WHATSAPP' | 'EMAIL';

interface ResultadoNotificacao {
  canal: NotificacaoCanal;
  destinatario?: string;
  sucesso: boolean;
  idNotificacao?: number;
  status?: string;
  erro?: string;
  mensagemUsuario?: string;
  codigoErro?: string;
  equipeNotificada?: boolean;
  tempoEstimadoEnvioSegundos?: number;
  posicaoFila?: number;
  tempoEstimadoEnvioTexto?: string;
}

interface SucessoEnvioInfo {
  canal: NotificacaoCanal;
  destinatario?: string;
  idNotificacao?: number;
  status?: string;
  tempoEstimadoEnvioTexto?: string;
  tempoEstimadoEnvioSegundos?: number;
  posicaoFila?: number;
}

interface ErroEnvioBanner {
  canal: NotificacaoCanal;
  titulo: string;
  mensagem: string;
  equipeNotificada: boolean;
}

interface OrcamentoEnviarResponse {
  orcamento?: unknown;
  notificacoes?: ResultadoNotificacao[];
}

interface HistoricoNotificacao {
  idOrcamentoNotificacao: number;
  canal: string;
  destinatario?: string;
  sucesso: boolean;
  erro?: string;
  dtCriacao: string;
}

interface MensagemCompartilhamento {
  mensagem: string;
  linkOrcamento: string;
}

@Component({
  selector: 'app-partilhar-orcamento',
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DividerModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './partilhar-orcamento.html',
  styleUrl: './partilhar-orcamento.scss',
})
export class PartilharOrcamento {
  @Input() idOrcamento!: number;
  @Input() cdPublico!: string;
  @Input() nuTelefone?: string;
  @Input() dsEmail?: string;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<any>();

  linkOrcamento = '';
  mensagemWhatsApp = '';
  carregandoMensagem = false;
  carregandoHistorico = false;
  historico: HistoricoNotificacao[] = [];
  readonly placeholdersAjuda =
    'Placeholders: {nomeCliente}, {numeroOrcamento}, {valorTotal}, {dataValidade}, {linkOrcamento}';
  gerandoPdf = false;
  enviandoWhatsApp = false;
  enviandoEmail = false;
  whatsappEnviado = false;
  emailEnviado = false;
  erroEnvio: ErroEnvioBanner | null = null;
  sucessoEnvio: SucessoEnvioInfo | null = null;

  public baseService = inject(BaseService);
  router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.cancel.emit();
  }

  showDialog() {
    this.linkOrcamento = `${window.location.origin}/public/orcamento/view/${this.cdPublico}`;
    this.whatsappEnviado = false;
    this.emailEnviado = false;
    this.erroEnvio = null;
    this.sucessoEnvio = null;
    this.visible = true;
    this.carregarMensagemPadrao();
    this.carregarHistorico();
  }

  private carregarMensagemPadrao() {
    if (!this.idOrcamento) {
      return;
    }
    this.carregandoMensagem = true;
    this.baseService.findAll(`orcamentos/${this.idOrcamento}/mensagem-compartilhamento`).subscribe({
      next: (res: MensagemCompartilhamento) => {
        this.mensagemWhatsApp = res?.mensagem ?? '';
        if (res?.linkOrcamento) {
          this.linkOrcamento = res.linkOrcamento;
        }
        this.carregandoMensagem = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.carregandoMensagem = false;
        this.cd.markForCheck();
      },
    });
  }

  private carregarHistorico() {
    if (!this.idOrcamento) {
      return;
    }
    this.carregandoHistorico = true;
    this.baseService.findAll(`orcamentos/${this.idOrcamento}/notificacoes`).subscribe({
      next: (res: HistoricoNotificacao[]) => {
        this.historico = res ?? [];
        this.carregandoHistorico = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.carregandoHistorico = false;
        this.cd.markForCheck();
      },
    });
  }

  enviarWhatsApp() {
    this.enviarPorCanal('WHATSAPP', this.nuTelefone, 'telefone');
  }

  enviarEmail() {
    this.enviarPorCanal('EMAIL', this.dsEmail, 'e-mail');
  }

  private enviarPorCanal(canal: NotificacaoCanal, destinatario: string | undefined, rotulo: string) {
    if (!this.idOrcamento) {
      this.messageService.add({
        severity: 'error',
        summary: 'Orçamento indisponível',
        detail: 'Não foi possível identificar o orçamento para envio.',
      });
      return;
    }

    if (!destinatario?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cliente sem contato',
        detail: `Cadastre o ${rotulo} do cliente antes de enviar por ${canal === 'WHATSAPP' ? 'WhatsApp' : 'e-mail'}.`,
        life: 6000,
      });
      return;
    }

    if (canal === 'WHATSAPP' && (this.enviandoWhatsApp || this.whatsappEnviado)) {
      return;
    }
    if (canal === 'EMAIL' && (this.enviandoEmail || this.emailEnviado)) {
      return;
    }

    if (canal === 'WHATSAPP') {
      this.enviandoWhatsApp = true;
    } else {
      this.enviandoEmail = true;
    }
    this.erroEnvio = null;
    this.sucessoEnvio = null;
    this.cd.markForCheck();

    this.baseService
      .post(`orcamentos/${this.idOrcamento}/enviar`, {
        canais: [canal],
        mensagem: canal === 'WHATSAPP' ? this.mensagemWhatsApp?.trim() : undefined,
        nuTelefone: canal === 'WHATSAPP' ? destinatario?.trim() : undefined,
        dsEmail: canal === 'EMAIL' ? destinatario?.trim() : undefined,
      })
      .subscribe({
        next: (res: OrcamentoEnviarResponse) => {
          const notificacoes = res?.notificacoes ?? [];
          const resultado = notificacoes.find((item) => item.canal === canal);
          if (resultado?.sucesso) {
            if (canal === 'WHATSAPP') {
              this.whatsappEnviado = true;
            } else {
              this.emailEnviado = true;
            }
            this.sucessoEnvio = this.montarSucessoEnvio(canal, resultado);
            this.carregarHistorico();
            this.messageService.add({
              severity: 'success',
              summary: canal === 'WHATSAPP' ? 'WhatsApp enfileirado' : 'E-mail enfileirado',
              detail: this.montarMensagemSucesso(canal, resultado),
              life: 6000,
            });
          } else if (notificacoes.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Integração indisponível',
              detail:
                'O orçamento foi marcado como enviado, mas o servidor não está com notificações ativas (NOTIFICACAO_ENABLED).',
              life: 8000,
            });
          } else {
            const erro = resultado?.erro ?? '';
            const integracaoNaoConfigurada =
              erro.toLowerCase().includes('nao configurada') ||
              erro.toLowerCase().includes('não configurada') ||
              resultado?.codigoErro === 'API_KEY_INVALIDA' ||
              resultado?.codigoErro === 'API_KEY_SEM_PERMISSAO';

            if (integracaoNaoConfigurada) {
              this.erroEnvio = {
                canal,
                titulo: 'Integração não configurada',
                mensagem:
                  'Configure a API Key em Configurações > Integrações antes de enviar mensagens ao cliente.',
                equipeNotificada: false,
              };
            } else {
              this.erroEnvio = {
                canal,
                titulo: canal === 'WHATSAPP' ? 'Não foi possível enviar o WhatsApp' : 'Não foi possível enviar o e-mail',
                mensagem:
                  resultado?.mensagemUsuario ||
                  'Ocorreu um problema ao enviar a mensagem. Tente novamente em alguns minutos.',
                equipeNotificada: !!resultado?.equipeNotificada,
              };
            }

            this.messageService.add({
              severity: integracaoNaoConfigurada ? 'warn' : 'error',
              summary: this.erroEnvio.titulo,
              detail: this.erroEnvio.mensagem,
              life: 10000,
            });
          }
          this.finalizarEnvio(canal);
        },
        error: () => this.finalizarEnvio(canal),
      });
  }

  private montarSucessoEnvio(canal: NotificacaoCanal, resultado: ResultadoNotificacao): SucessoEnvioInfo {
    return {
      canal,
      destinatario: resultado.destinatario,
      idNotificacao: resultado.idNotificacao,
      status: resultado.status,
      tempoEstimadoEnvioTexto: resultado.tempoEstimadoEnvioTexto,
      tempoEstimadoEnvioSegundos: resultado.tempoEstimadoEnvioSegundos,
      posicaoFila: resultado.posicaoFila,
    };
  }

  labelStatusNotificacao(status?: string): string {
    if (!status) {
      return '—';
    }
    const labels: Record<string, string> = {
      PENDENTE: 'Na fila',
      PROCESSANDO: 'Processando',
      ENVIADA: 'Enviada',
      ENTREGUE: 'Entregue',
      LIDA: 'Lida',
      FALHOU: 'Falhou',
      BLOQUEADA: 'Bloqueada',
      CANCELADA: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  severidadeStatus(status?: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'ENVIADA':
      case 'ENTREGUE':
      case 'LIDA':
        return 'success';
      case 'PENDENTE':
      case 'PROCESSANDO':
        return 'info';
      case 'BLOQUEADA':
        return 'warn';
      case 'FALHOU':
      case 'CANCELADA':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  fecharSucessoEnvio(): void {
    this.sucessoEnvio = null;
    this.cd.markForCheck();
  }

  private montarMensagemSucesso(canal: NotificacaoCanal, resultado?: ResultadoNotificacao): string {
    const base =
      canal === 'WHATSAPP'
        ? 'A mensagem foi enfileirada para envio ao cliente.'
        : 'O e-mail foi enfileirado para envio ao cliente.';

    const estimativa = resultado?.tempoEstimadoEnvioTexto?.trim();
    if (!estimativa) {
      return base;
    }

    const fila =
      resultado?.posicaoFila != null && resultado.posicaoFila > 0
        ? ` Ha ${resultado.posicaoFila} mensagem(ns) na frente na fila.`
        : '';

    return `${base} Previsao de envio: ${estimativa}.${fila}`;
  }

  fecharErroEnvio(): void {
    this.erroEnvio = null;
    this.cd.markForCheck();
  }

  private finalizarEnvio(canal: NotificacaoCanal) {
    if (canal === 'WHATSAPP') {
      this.enviandoWhatsApp = false;
    } else {
      this.enviandoEmail = false;
    }
    this.cd.markForCheck();
  }

  copiarLink() {
    navigator.clipboard.writeText(this.linkOrcamento);
    this.messageService.add({
      severity: 'success',
      summary: 'Link copiado',
      detail: 'O link do orçamento foi copiado para a área de transferência.',
      life: 3000,
    });
  }

  abrirView() {
    this.router.navigate(['public/orcamento/view', this.cdPublico]);
  }

  gerarPdf(): void {
    if (this.gerandoPdf) {
      return;
    }

    this.gerandoPdf = true;
    this.baseService.gerarEAbrirRelatorioPdf(this.cdPublico).subscribe({
      complete: () => {
        this.gerandoPdf = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.gerandoPdf = false;
        this.cd.markForCheck();
      },
    });
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }
    return new Date(data).toLocaleString('pt-BR');
  }
}
