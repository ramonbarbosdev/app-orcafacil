import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LOGO_PADRAO_URL, OrganizacaoLogoMetadados } from '../models/organizacao-logo';
import {
  lerDimensoesImagem,
  validarArquivoBasico,
  validarImagemAntesEditor,
  validarLogoParaUpload,
} from '../utils/logo-edicao.util';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizacaoLogoService implements OnDestroy {
  private readonly endpoint = 'organizacao/logo';
  private readonly baseService = inject(BaseService);
  private readonly apiUrl = environment.apiUrl;

  private previewObjectUrl: string | null = null;
  private readonly atualizacaoSubject = new BehaviorSubject<number>(0);
  readonly atualizacao$ = this.atualizacaoSubject.asObservable();

  ngOnDestroy(): void {
    this.revogarPreview();
  }

  obterMetadados(): Observable<OrganizacaoLogoMetadados> {
    return this.baseService.findAll(this.endpoint);
  }

  enviar(file: File): Observable<OrganizacaoLogoMetadados> {
    return this.baseService.uploadFile(this.endpoint, file).pipe(tap(() => this.notificarAtualizacao()));
  }

  salvarUrl(logoUrl: string): Observable<OrganizacaoLogoMetadados> {
    return this.baseService.update(`${this.endpoint}/url`, { logoUrl }).pipe(tap(() => this.notificarAtualizacao()));
  }

  remover(): Observable<OrganizacaoLogoMetadados> {
    return this.baseService.deleteEndpoint<OrganizacaoLogoMetadados>(this.endpoint).pipe(
      tap(() => this.notificarAtualizacao())
    );
  }

  removerUrl(): Observable<OrganizacaoLogoMetadados> {
    return this.baseService.deleteEndpoint<OrganizacaoLogoMetadados>(`${this.endpoint}/url`).pipe(
      tap(() => this.notificarAtualizacao())
    );
  }

  obterUrlExibicaoAutenticada(): Observable<string | null> {
    return new Observable((subscriber) => {
      this.obterMetadados().subscribe({
        next: (meta) => {
          if (!meta.possuiLogo) {
            this.revogarPreview();
            subscriber.next(null);
            subscriber.complete();
            return;
          }

          if (meta.modo === 'URL' && meta.logoUrlExterna) {
            this.revogarPreview();
            subscriber.next(meta.logoUrlExterna);
            subscriber.complete();
            return;
          }

          this.baseService.getBlob(`${this.endpoint}/imagem`).subscribe({
            next: (blob) => {
              this.revogarPreview();
              this.previewObjectUrl = URL.createObjectURL(blob);
              subscriber.next(this.previewObjectUrl);
              subscriber.complete();
            },
            error: (err) => subscriber.error(err),
          });
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  /** @deprecated Use obterUrlExibicaoAutenticada */
  obterBlobPreviewAutenticado(): Observable<string | null> {
    return this.obterUrlExibicaoAutenticada();
  }

  urlImagemPublica(logoUrl: string | undefined | null): string | null {
    if (!logoUrl) {
      return null;
    }
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${this.apiUrl}${path}`;
  }

  urlPadrao(): string {
    return LOGO_PADRAO_URL;
  }

  notificarAtualizacao(): void {
    this.atualizacaoSubject.next(Date.now());
  }

  revogarPreview(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  validarArquivoCliente(file: File): string | null {
    return validarArquivoBasico(file);
  }

  async validarImagemParaEditor(file: File): Promise<string | null> {
    const erroBasico = validarArquivoBasico(file);
    if (erroBasico) {
      return erroBasico;
    }
    try {
      const { largura, altura } = await lerDimensoesImagem(file);
      return validarImagemAntesEditor(largura, altura);
    } catch {
      return 'Não foi possível ler a imagem. Envie um arquivo PNG, JPG ou WEBP válido';
    }
  }

  async validarAntesUpload(file: File): Promise<string | null> {
    const erroBasico = validarArquivoBasico(file);
    if (erroBasico) {
      return erroBasico;
    }
    try {
      const { largura, altura } = await lerDimensoesImagem(file);
      return validarLogoParaUpload(largura, altura, file.size);
    } catch {
      return 'Não foi possível validar a imagem antes do envio';
    }
  }
}
