import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/api';
import { FlagOption } from '../models/flag-option';
import { ApiResponse } from '../models/api.types';
import { isAuthHandledStatus } from '../utils/http-error.util';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  private readonly apiUrl = environment.apiUrl;
  private static readonly RELATORIO_PDF_TOAST_KEY = 'relatorio-pdf';
  private messageService = inject(MessageService);

  constructor(private http: HttpClient) {}

  private unwrap<T>(obs: Observable<ApiResponse<T> | T>): Observable<T> {
    return obs.pipe(
      map((res) => {
        if (res && typeof res === 'object' && 'data' in res) {
          return (res as ApiResponse<T>).data;
        }
        return res as T;
      })
    );
  }

  obterObjetoOpcoes(
    endpoint: string,
    nameParam: string,
    codeParam: string
  ): Observable<FlagOption[]> {
    return this.findAll(endpoint).pipe(
      map((res) =>
        (res as any[]).map((index: any) => {
          const item = new FlagOption();
          item.code = codeParam.length === 0 ? index : String(index[codeParam]);
          item.name = nameParam.length === 0 ? index : index[nameParam];
          return item;
        })
      ),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  findSequence(endpoint: string): Observable<{ sequencia: string }> {
    return this.unwrap(this.http.get<ApiResponse<string>>(`${this.apiUrl}/${endpoint}/sequencia`)).pipe(
      map((res) => this.normalizarSequencia(res)),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  private normalizarSequencia(res: unknown): { sequencia: string } {
    if (typeof res === 'string' || typeof res === 'number') {
      return { sequencia: String(res) };
    }
    if (res && typeof res === 'object' && 'sequencia' in res) {
      return { sequencia: String((res as { sequencia: unknown }).sequencia ?? '') };
    }
    return { sequencia: '' };
  }

  findAll(endpoint: string): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`)).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  listarPaginado(endpoint: string): Observable<any[]> {
    return this.findAll(endpoint);
  }

  findById(endpoint: string, id: any): Observable<any> {
    return this.unwrap(this.http.get<ApiResponse<any>>(`${this.apiUrl}/${endpoint}/${id}`)).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  create(endpoint: string, data: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`, data)).pipe(
      tap((res) => this.exibirSucessoFromData(res)),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`, data)).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  postRaw(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, data).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  update(endpoint: string, data: any): Observable<any> {
    return this.unwrap(this.http.put<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`, data)).pipe(
      tap(() => this.exibirSucesso('Operação realizada com sucesso')),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  save(endpoint: string, data: any, id?: number | null): Observable<any> {
    if (id) {
      return this.update(`${endpoint}/${id}`, data);
    }
    return this.create(endpoint, data);
  }

  deleteById(endpoint: string, id: number | string): Observable<any> {
    return this.unwrap(this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${endpoint}/${id}`)).pipe(
      tap(() => this.exibirSucesso('Registro excluído com sucesso')),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  getPdf(url: string, id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${url}/${id}`, { responseType: 'blob' });
  }

  gerarEAbrirRelatorioPdf(codigoPublico: string): Observable<void> {
    const codigo = codigoPublico?.trim();
    if (!codigo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Relatório indisponível',
        detail: 'Este orçamento ainda não possui código público para gerar o PDF.',
        life: 5000,
      });
      return throwError(() => new Error('Código público inválido'));
    }

    this.iniciarFeedbackRelatorio();

    return this.getPdf('orcamentos/relatorio', codigo).pipe(
      tap((blob) => this.abrirPdfNoNavegador(blob)),
      map(() => undefined),
      tap(() => this.finalizarFeedbackRelatorioSucesso()),
      catchError((e) => {
        if (!('status' in e) || !isAuthHandledStatus(e.status ?? 0)) {
          this.exibirErros(e);
        }
        return throwError(() => e);
      }),
      finalize(() => this.messageService.clear(BaseService.RELATORIO_PDF_TOAST_KEY)),
    );
  }

  private iniciarFeedbackRelatorio(): void {
    this.messageService.clear(BaseService.RELATORIO_PDF_TOAST_KEY);
    this.messageService.add({
      key: BaseService.RELATORIO_PDF_TOAST_KEY,
      severity: 'info',
      summary: 'Gerando relatório',
      detail: 'Aguarde, o PDF está sendo preparado...',
      sticky: true,
      closable: false,
    });
  }

  private finalizarFeedbackRelatorioSucesso(): void {
    this.messageService.clear(BaseService.RELATORIO_PDF_TOAST_KEY);
    this.messageService.add({
      severity: 'success',
      summary: 'Relatório pronto',
      detail: 'O PDF foi aberto em uma nova aba do navegador.',
      life: 4000,
    });
  }

  private abrirPdfNoNavegador(blob: Blob): void {
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(fileURL), 60_000);
  }

  getPublic<T>(endpoint: string): Observable<T> {
    return this.unwrap(this.http.get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`));
  }

  uploadFile(endpoint: string, file: File, fieldName = 'file'): Observable<any> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.unwrap(this.http.post<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`, formData)).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  deleteEndpoint<T = void>(endpoint: string): Observable<T> {
    return this.unwrap(this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`)).pipe(
      tap(() => this.exibirSucesso('Operação realizada com sucesso')),
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { responseType: 'blob' }).pipe(
      catchError((e) => {
        this.exibirErros(e);
        return throwError(() => e);
      })
    );
  }

  getPublicBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { responseType: 'blob' });
  }

  exibirErros(e: HttpErrorResponse | { error?: { message?: string; error?: string; hint?: string }; status?: number }): void {
    if ('status' in e && isAuthHandledStatus(e.status ?? 0)) {
      return;
    }

    const err = e.error;
    const detail = [err?.message, err?.hint].filter(Boolean).join(' ');
    this.messageService.add({
      severity: 'error',
      summary: 'Não foi possível concluir',
      detail: detail || err?.error || 'Ocorreu um erro inesperado. Tente novamente.',
    });
  }

  private exibirSucessoFromData(_res: unknown): void {
    this.exibirSucesso('Operação realizada com sucesso');
  }

  private exibirSucesso(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail,
    });
  }
}
