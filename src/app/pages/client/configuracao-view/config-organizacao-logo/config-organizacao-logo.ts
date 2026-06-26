import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../../auth/auth.service';
import { OrganizacaoLogoMetadados } from '../../../../models/organizacao-logo';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { OrganizacaoLogoService } from '../../../../services/organizacao-logo.service';
import { LogoEditorDialog } from '../../../../components/logo-editor-dialog/logo-editor-dialog';

@Component({
  selector: 'app-config-organizacao-logo',
  standalone: true,
  imports: [CommonModule, LayoutCardConfig, ButtonModule, ProgressSpinnerModule, LogoEditorDialog],
  templateUrl: './config-organizacao-logo.html',
  styleUrl: './config-organizacao-logo.scss',
})
export class ConfigOrganizacaoLogo implements OnInit, OnDestroy {
  private logoService = inject(OrganizacaoLogoService);
  auth = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  loading = true;
  enviando = false;
  removendo = false;
  metadados: OrganizacaoLogoMetadados | null = null;
  previewUrl: string | null = null;
  editorVisible = false;
  arquivoParaEditar: File | null = null;

  get podeEnviar(): boolean {
    return this.auth.hasPermission('organizacao.criar');
  }

  get podeRemover(): boolean {
    return this.auth.hasPermission('organizacao.deletar');
  }

  get possuiLogo(): boolean {
    return !!this.metadados?.possuiLogo;
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

  private enviarLogo(file: File): void {
    this.enviando = true;
    this.logoService.enviar(file).subscribe({
      next: (meta) => {
        this.metadados = meta;
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
    this.confirmationService.confirm({
      message: 'Deseja remover a logo personalizada? Ela será excluída permanentemente.',
      header: 'Remover logo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.executarRemocao(),
    });
  }

  private executarRemocao(): void {
    this.removendo = true;
    this.logoService.remover().subscribe({
      next: (meta) => {
        this.metadados = meta;
        this.previewUrl = null;
        this.logoService.revogarPreview();
        this.removendo = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Logo removida',
          detail: 'A logo foi excluída da organização.',
        });
        this.cd.markForCheck();
      },
      error: () => {
        this.removendo = false;
        this.carregar(false);
        this.cd.markForCheck();
      },
    });
  }

  private atualizarPreview(): void {
    this.logoService.obterBlobPreviewAutenticado().subscribe({
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
}
