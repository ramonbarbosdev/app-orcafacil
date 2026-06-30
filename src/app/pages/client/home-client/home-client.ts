import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DashboardService } from '../../../services/dashboard.service';
import {
  DashboardResumo,
  STATUS_ORCAMENTO_COR,
  STATUS_ORCAMENTO_LABEL,
} from '../../../models/dashboard';

@Component({
  selector: 'app-home-client',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './home-client.html',
  styleUrl: './home-client.scss',
})
export class HomeClient implements OnInit {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private cd = inject(ChangeDetectorRef);

  loading = true;
  erro = false;
  resumo: DashboardResumo | null = null;

  chartStatus: unknown;
  chartStatusOptions: unknown;
  chartEvolucao: unknown;
  chartEvolucaoOptions: unknown;

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.loading = true;
    this.erro = false;
    this.dashboardService.obterResumo().subscribe({
      next: (res) => {
        this.resumo = res;
        this.montarGraficos(res);
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.erro = true;
        this.cd.markForCheck();
      },
    });
  }

  private montarGraficos(res: DashboardResumo): void {
    const statuses = Object.entries(res.totaisPorStatus ?? {}).filter(([, qtd]) => qtd > 0);
    const labels = statuses.map(([s]) => STATUS_ORCAMENTO_LABEL[s] ?? s);
    const cores = statuses.map(([s]) => STATUS_ORCAMENTO_COR[s] ?? '#64748b');

    this.chartStatus = {
      labels,
      datasets: [
        {
          data: statuses.map(([, qtd]) => qtd),
          backgroundColor: cores,
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };

    this.chartStatusOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 16 },
        },
      },
    };

    const serie = res.serieMensal ?? [];
    this.chartEvolucao = {
      labels: serie.map((s) => s.mes),
      datasets: [
        {
          type: 'bar',
          label: 'Orçamentos',
          data: serie.map((s) => s.totalOrcamentos),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Faturamento aprovado',
          data: serie.map((s) => s.faturamentoAprovado),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          tension: 0.35,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    };

    this.chartEvolucaoOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          ticks: { precision: 0 },
          title: { display: true, text: 'Qtd.' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: {
            callback: (value: number) =>
              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
          },
          title: { display: true, text: 'R$' },
        },
      },
    };
  }

  statusLabel(status: string): string {
    return STATUS_ORCAMENTO_LABEL[status] ?? status;
  }

  statusSeverity(status: string): 'secondary' | 'info' | 'warn' | 'success' | 'danger' {
    switch (status) {
      case 'APROVADO':
        return 'success';
      case 'REJEITADO':
        return 'danger';
      case 'ENVIADO':
        return 'warn';
      case 'GERADO':
        return 'info';
      default:
        return 'secondary';
    }
  }

  variacaoClasse(valor?: number | null): string {
    if (valor == null || valor === 0) return 'text-surface-500';
    return valor > 0 ? 'text-green-600' : 'text-red-500';
  }

  formatarVariacao(valor?: number | null): string {
    if (valor == null) return '—';
    const sinal = valor > 0 ? '+' : '';
    return `${sinal}${valor}% vs. mês anterior`;
  }

  novoOrcamento(): void {
    this.router.navigate(['/client/orcamento/novo']);
  }

  listaOrcamento(): void {
    this.router.navigate(['/client/orcamento']);
  }

  visualizar(id: number): void {
    this.router.navigate(['/client/orcamento', id]);
  }
}
