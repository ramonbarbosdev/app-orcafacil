import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';
import {
  extensaoPorMime,
  PROPORCOES_LOGO,
  ProporcaoLogoOpcao,
  validarImagemLogoRecortada,
} from '../../utils/logo-edicao.util';

@Component({
  selector: 'app-logo-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectButtonModule,
    ImageCropperComponent,
  ],
  templateUrl: './logo-editor-dialog.html',
  styleUrl: './logo-editor-dialog.scss',
})
export class LogoEditorDialog implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() arquivo: File | null = null;
  @Output() confirmar = new EventEmitter<File>();

  @ViewChild(ImageCropperComponent) cropper?: ImageCropperComponent;

  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  proporcoes = PROPORCOES_LOGO;
  proporcaoSelecionada: ProporcaoLogoOpcao = PROPORCOES_LOGO[0];
  manterProporcao = true;
  aspectRatio = 2;
  formatoSaida: 'png' | 'jpeg' | 'webp' = 'png';
  imageFile: File | undefined;
  ultimoRecorte: ImageCroppedEvent | null = null;
  aplicando = false;
  transform: ImageTransform = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['arquivo'] || changes['visible']) {
      if (this.visible && this.arquivo) {
        this.prepararArquivo(this.arquivo);
      }
      if (!this.visible) {
        this.limparEstado();
      }
    }
  }

  get titulo(): string {
    return 'Editar logo';
  }

  onProporcaoChange(opcao: ProporcaoLogoOpcao): void {
    this.proporcaoSelecionada = opcao;
    this.manterProporcao = opcao.valor != null;
    this.aspectRatio = opcao.valor ?? 2;
  }

  girarEsquerda(): void {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate ?? 0) - 90,
    };
  }

  girarDireita(): void {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate ?? 0) + 90,
    };
  }

  zoom(delta: number): void {
    const escalaAtual = this.transform.scale ?? 1;
    const proxima = Math.min(3, Math.max(0.5, escalaAtual + delta));
    this.transform = { ...this.transform, scale: proxima };
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.ultimoRecorte = event;
  }

  loadImageFailed(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Imagem inválida',
      detail: 'Não foi possível carregar a imagem selecionada.',
    });
    this.fechar();
  }

  async aplicar(): Promise<void> {
    this.aplicando = true;
    try {
      let recorte = this.ultimoRecorte;
      if (this.cropper) {
        const resultado = await this.cropper.crop('blob');
        if (resultado) {
          recorte = resultado;
        }
      }
      if (!recorte?.blob) {
        throw new Error('Não foi possível gerar a imagem recortada');
      }

      const erro = validarImagemLogoRecortada(recorte.width, recorte.height, recorte.blob.size);
      if (erro) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Ajuste necessário',
          detail: erro,
        });
        return;
      }

      const extensao = extensaoPorMime(recorte.blob.type || 'image/png');
      const nomeBase = (this.arquivo?.name || 'logo').replace(/\.[^.]+$/, '');
      const arquivoFinal = new File([recorte.blob], `${nomeBase}-editada.${extensao}`, {
        type: recorte.blob.type || 'image/png',
      });
      this.confirmar.emit(arquivoFinal);
      this.fechar();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Não foi possível aplicar',
        detail: 'Tente ajustar o recorte e enviar novamente.',
      });
    } finally {
      this.aplicando = false;
      this.cd.markForCheck();
    }
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limparEstado();
  }

  private prepararArquivo(file: File): void {
    this.limparEstado();
    this.imageFile = file;
    const tipo = file.type.toLowerCase();
    if (tipo === 'image/jpeg') {
      this.formatoSaida = 'jpeg';
    } else if (tipo === 'image/webp') {
      this.formatoSaida = 'webp';
    } else {
      this.formatoSaida = 'png';
    }
    this.onProporcaoChange(PROPORCOES_LOGO[0]);
  }

  private limparEstado(): void {
    this.imageFile = undefined;
    this.ultimoRecorte = null;
    this.transform = {};
    this.aplicando = false;
  }
}
