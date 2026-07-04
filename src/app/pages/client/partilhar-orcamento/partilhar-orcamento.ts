import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
import { labelStatusNotificacao, resolverMensagemExibicao } from '../../../shared/notificacao.labels';

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
  integracaoNotificacaoAtiva?: boolean;
  mensagemCompartilhamento?: string;
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
  integracaoNotificacaoAtiva?: boolean;
}

interface IntegracaoTenantConfig {
  habilitada?: boolean;
  configurada?: boolean;
  mensagem?: string;
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
export class PartilharOrcamento implements OnChanges {
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
  integracaoNotificacaoAtiva = false;
  integracaoVerificada = false;

  public baseService = inject(BaseService);
  router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.visible) {
      return;
    }
    if (changes['idOrcamento']?.currentValue || changes['visible']?.currentValue === true) {
      this.carregarDadosCompartilhamento();
    }
  }

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
    this.integracaoNotificacaoAtiva = false;
    this.integracaoVerificada = false;
    this.carregarDadosCompartilhamento();
  }

  private carregarDadosCompartilhamento(): void {
    this.carregarStatusIntegracao();

    if (!this.idOrcamento) {
      queueMicrotask(() => {
        if (this.visible && this.idOrcamento) {
          this.carregarMensagemPadrao();
          this.carregarHistorico();
        }
      });
      return;
    }

    this.carregarMensagemPadrao();
    this.carregarHistorico();
  }

  private carregarStatusIntegracao(): void {
    this.baseService.findAll('integracao-notificacao/config').subscribe({
      next: (res: IntegracaoTenantConfig) => {
        this.integracaoNotificacaoAtiva = !!res?.habilitada;
        this.integracaoVerificada = true;
        this.cd.markForCheck();
      },
      error: () => {
        this.integracaoVerificada = true;
        this.cd.markForCheck();
      },
    });
  }

  private carregarMensagemPadrao() {
    if (!this.idOrcamento) {
      return;
    }
    this.carregandoMensagem = true;
    this.baseService.findAll(`orcamentos/${this.idOrcamento}/mensagem-compartilhamento`).subscribe({
      next: (res: MensagemCompartilhamento) => {
        this.mensagemWhatsApp = res?.mensagem ?? '';
        if (res?.integracaoNotificacaoAtiva != null) {
          this.integracaoNotificacaoAtiva = !!res.integracaoNotificacaoAtiva;
        }
        this.integracaoVerificada = true;
        if (res?.linkOrcamento) {
          this.linkOrcamento = res.linkOrcamento;
        }
        this.carregandoMensagem = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.carregandoMensagem = false;
        this.integracaoVerificada = true;
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
    if (!this.integracaoNotificacaoAtiva) {
      this.copiarMensagem('WhatsApp');
      return;
    }
    this.enviarPorCanal('WHATSAPP', this.nuTelefone, 'telefone');
  }

  enviarEmail() {
    if (!this.integracaoNotificacaoAtiva) {
      this.copiarMensagem('e-mail');
      return;
    }
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
          if (res?.integracaoNotificacaoAtiva != null) {
            this.integracaoNotificacaoAtiva = !!res.integracaoNotificacaoAtiva;
          }

          if (res?.integracaoNotificacaoAtiva === false) {
            this.copiarMensagem(canal === 'WHATSAPP' ? 'WhatsApp' : 'e-mail');
            this.finalizarEnvio(canal);
            return;
          }

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
                titulo: 'Integração não liberada',
                mensagem:
                  'A integração de notificações não está ativa para esta organização. Copie a mensagem e envie manualmente.',
                equipeNotificada: false,
              };
            } else {
              this.erroEnvio = {
                canal,
                titulo: canal === 'WHATSAPP' ? 'Não foi possível enviar o WhatsApp' : 'Não foi possível enviar o e-mail',
                mensagem: this.labelErroNotificacao(
                  resultado?.erro,
                  resultado?.codigoErro,
                  resultado?.mensagemUsuario
                ) || 'Ocorreu um problema ao enviar a mensagem. Tente novamente em alguns minutos.',
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

  readonly labelStatusNotificacao = labelStatusNotificacao;

  labelErroNotificacao(erro?: string, codigo?: string, mensagemUsuario?: string): string {
    return resolverMensagemExibicao(
      mensagemUsuario ?? erro,
      codigo ?? erro,
      'Não foi possível enviar a mensagem.'
    );
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

  copiarMensagem(canal: string): void {
    const texto = this.mensagemWhatsApp?.trim();
    if (!texto) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Mensagem vazia',
        detail: 'Não há mensagem para copiar.',
        life: 4000,
      });
      return;
    }

    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Mensagem copiada',
        detail: `Cole no ${canal} e envie manualmente ao cliente.`,
        life: 6000,
      });
    });
  }

  labelAcaoCanal(canal: 'WHATSAPP' | 'EMAIL'): string {
    if (!this.integracaoNotificacaoAtiva) {
      return 'Copiar mensagem';
    }
    return canal === 'WHATSAPP' ? 'WhatsApp' : 'E-mail';
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
