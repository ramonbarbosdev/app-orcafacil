import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AuthService } from '../../../../auth/auth.service';
import { LogoEditorDialog } from '../../../../components/logo-editor-dialog/logo-editor-dialog';
import { OrganizacaoLogoMetadados } from '../../../../models/organizacao-logo';
import { OrganizacaoLogoService } from '../../../../services/organizacao-logo.service';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';

type ModoConfiguracao = 'arquivo' | 'url';

@Component({
  selector: 'app-config-organizacao-logo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutCardConfig,
    ButtonModule,
    ProgressSpinnerModule,
    LogoEditorDialog,
    SelectButtonModule,
    InputTextModule,
  ],
  templateUrl: './config-organizacao-logo.html',
  styleUrl: './config-organizacao-logo.scss',
})
export class ConfigOrganizacaoLogo implements OnInit, OnDestroy {
  private logoService = inject(OrganizacaoLogoService);
  auth = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  readonly opcoesModo = [
    { label: 'Arquivo', value: 'arquivo' as ModoConfiguracao },
    { label: 'URL', value: 'url' as ModoConfiguracao },
  ];

  loading = true;
  enviando = false;
  salvandoUrl = false;
  removendo = false;
  metadados: OrganizacaoLogoMetadados | null = null;
  previewUrl: string | null = null;
  editorVisible = false;
  arquivoParaEditar: File | null = null;
  modoConfiguracao: ModoConfiguracao = 'arquivo';
  logoUrlInput = '';

  get podeEnviar(): boolean {
    return this.auth.hasPermission('organizacao.criar');
  }

  get podeRemover(): boolean {
    return this.auth.hasPermission('organizacao.deletar');
  }

  get possuiLogo(): boolean {
    return !!this.metadados?.possuiLogo;
  }

  get modoAtivo(): string | undefined {
    return this.metadados?.modo;
  }

  ngOnInit(): void {
    if (!this.auth.hasPermission('organizacao.ler')) {
      this.loading = false;
      return;
    }
    this.carregar();
    this.logoService.atualizacao$.subscribe(() => this.carregar(false));
  }

  ngOnDestroy(): void {
    this.logoService.revogarPreview();
  }

  carregar(exibirLoading = true): void {
    if (exibirLoading) {
      this.loading = true;
    }
    this.logoService.obterMetadados().subscribe({
      next: (meta) => {
        this.metadados = meta;
        if (meta.modo === 'URL') {
          this.modoConfiguracao = 'url';
          this.logoUrlInput = meta.logoUrlExterna ?? '';
        } else if (meta.modo === 'UPLOAD') {
          this.modoConfiguracao = 'arquivo';
        }
        this.atualizarPreview();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  async onArquivoSelecionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!this.podeEnviar) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sem permissão',
        detail: 'Você não pode alterar a logo da organização.',
      });
      return;
    }
    const erroImagem = await this.logoService.validarImagemParaEditor(file);
    if (erroImagem) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Arquivo inválido',
        detail: erroImagem,
      });
      return;
    }
    this.arquivoParaEditar = file;
    this.editorVisible = true;
    this.cd.markForCheck();
  }

  async onLogoEditada(file: File): Promise<void> {
    const erroUpload = await this.logoService.validarAntesUpload(file);
    if (erroUpload) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Logo fora do padrão',
        detail: erroUpload,
      });
      return;
    }
    this.enviarLogo(file);
  }

  salvarLogoUrl(): void {
    if (!this.podeEnviar || this.salvandoUrl) {
      return;
    }
    const url = this.logoUrlInput.trim();
    if (!url) {
      this.messageService.add({
        severity: 'warn',
        summary: 'URL obrigatória',
        detail: 'Informe a URL da imagem da logo.',
      });
      return;
    }
    this.salvandoUrl = true;
    this.logoService.salvarUrl(url).subscribe({
      next: (meta) => {
        this.metadados = meta;
        this.salvandoUrl = false;
        this.atualizarPreview();
        this.messageService.add({
          severity: 'success',
          summary: 'Logo atualizada',
          detail: 'A URL da logo foi salva com sucesso.',
        });
      },
      error: () => {
        this.salvandoUrl = false;
        this.cd.markForCheck();
      },
    });
  }

  private enviarLogo(file: File): void {
    this.enviando = true;
    this.logoService.enviar(file).subscribe({
      next: (meta) => {
        this.metadados = meta;
        this.modoConfiguracao = 'arquivo';
        this.enviando = false;
        this.atualizarPreview();
      },
      error: () => {
        this.enviando = false;
        this.cd.markForCheck();
      },
    });
  }

  confirmarRemocao(): void {
    if (!this.podeRemover || !this.possuiLogo || this.removendo) {
      return;
    }
    const removeUpload = this.modoAtivo === 'UPLOAD';
    this.confirmationService.confirm({
      message: removeUpload
        ? 'Deseja remover o arquivo da logo? Se houver URL cadastrada, ela passará a ser usada.'
        : 'Deseja remover a URL da logo?',
      header: 'Remover logo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.executarRemocao(removeUpload),
    });
  }

  private executarRemocao(removeUpload: boolean): void {
    this.removendo = true;
    const operacao = removeUpload ? this.logoService.remover() : this.logoService.removerUrl();
    operacao.subscribe({
      next: (meta) => {
        this.metadados = meta;
        this.previewUrl = null;
        this.logoService.revogarPreview();
        if (meta.modo === 'URL') {
          this.logoUrlInput = meta.logoUrlExterna ?? '';
        } else if (meta.modo === 'NENHUM') {
          this.logoUrlInput = '';
        }
        this.removendo = false;
        this.atualizarPreview();
        this.messageService.add({
          severity: 'success',
          summary: 'Logo removida',
          detail: 'A configuração da logo foi atualizada.',
        });
      },
      error: () => {
        this.removendo = false;
        this.carregar(false);
        this.cd.markForCheck();
      },
    });
  }

  private atualizarPreview(): void {
    this.logoService.obterUrlExibicaoAutenticada().subscribe({
      next: (url) => {
        this.previewUrl = url;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.previewUrl = null;
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  onPreviewErro(): void {
    this.previewUrl = null;
    this.logoService.revogarPreview();
    this.cd.markForCheck();
  }
}
