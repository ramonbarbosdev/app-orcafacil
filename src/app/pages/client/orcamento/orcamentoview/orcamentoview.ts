import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OrcamentoVisualizacao } from '../../../../models/orcamento-visualizacao';
import { BaseService } from '../../../../services/base.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OrganizacaoLogoService } from '../../../../services/organizacao-logo.service';

@Component({
  selector: 'app-orcamentoview',
  imports: [
    CommonModule,
    CardModule,
    AccordionModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './orcamentoview.html',
  styleUrl: './orcamentoview.scss',
})
export class Orcamentoview implements OnInit, OnDestroy {
  orcamento?: OrcamentoVisualizacao;
  loading = true;
  erro: string | null = null;
  codigoPublico = '';
  gerandoPdf = false;

  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private baseService = inject(BaseService);
  private logoService = inject(OrganizacaoLogoService);
  private tinhaTemaEscuro = false;

  logoPublicaUrl: string | null = null;

  ngOnInit(): void {
    this.forcarTemaClaro();
    this.codigoPublico = this.route.snapshot.paramMap.get('codigo') ?? '';
    if (!this.codigoPublico) {
      this.erro = 'Link do orçamento inválido.';
      this.loading = false;
      return;
    }

    this.baseService.getPublic<OrcamentoVisualizacao>(`orcamentos/visualizacao/${this.codigoPublico}`).subscribe({
      next: (res) => {
        this.orcamento = res;
        this.logoPublicaUrl = this.logoService.urlImagemPublica(res?.logoUrl);
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.erro = 'Não foi possível carregar este orçamento. Verifique se o link está correto ou se o orçamento ainda está disponível.';
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.restaurarTema();
  }

  private forcarTemaClaro(): void {
    this.tinhaTemaEscuro = document.documentElement.classList.contains('app-dark');
    document.documentElement.classList.remove('app-dark');
  }

  private restaurarTema(): void {
    if (this.tinhaTemaEscuro) {
      document.documentElement.classList.add('app-dark');
    }
  }

  labelStatus(status?: string): string {
    const labels: Record<string, string> = {
      RASCUNHO: 'Rascunho',
      GERADO: 'Gerado',
      ENVIADO: 'Enviado',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado',
    };
    return status ? labels[status] ?? status : '—';
  }

  severidadeStatus(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'APROVADO':
        return 'success';
      case 'ENVIADO':
        return 'info';
      case 'GERADO':
        return 'warn';
      case 'REJEITADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  statusClass(status?: string): Record<string, boolean> {
    return {
      'bg-surface-200 text-surface-700': status === 'RASCUNHO',
      'bg-blue-100 text-blue-800': status === 'GERADO',
      'bg-sky-100 text-sky-800': status === 'ENVIADO',
      'bg-green-100 text-green-800': status === 'APROVADO',
      'bg-red-100 text-red-800': status === 'REJEITADO',
    };
  }

  labelTipoItem(tipo?: string): string {
    if (tipo === 'Servico') return 'Serviço';
    if (tipo === 'Produto') return 'Produto';
    return tipo ?? 'Item';
  }

  labelMaterial(material: { nome?: string; descricao?: string }): string {
    return material.nome?.trim() || material.descricao?.trim() || 'Composição';
  }

  temItens(): boolean {
    return (this.orcamento?.itens?.length ?? 0) > 0;
  }

  temHistorico(): boolean {
    return (this.orcamento?.historicoStatus?.length ?? 0) > 0;
  }

  onLogoErro(): void {
    this.logoPublicaUrl = null;
    this.cd.markForCheck();
  }

  formatarPrazo(dias?: number): string {
    if (dias == null) return '—';
    return dias === 1 ? '1 dia útil' : `${dias} dias úteis`;
  }

  baixarPdf(): void {
    if (!this.codigoPublico || this.gerandoPdf) {
      return;
    }
    this.gerandoPdf = true;
    this.baseService.gerarEAbrirRelatorioPdf(this.codigoPublico).subscribe({
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

  readonly empresaFallback = 'OrçaFácil';
}
