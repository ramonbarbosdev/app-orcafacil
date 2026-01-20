import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-home-client',
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  templateUrl: './home-client.html',
  styleUrl: './home-client.scss',
})
export class HomeClient {

  router = inject(Router);
  public orcamentosRecentes: any[] = [];

  statusClass(status: string) {
    return {
      'bg-warning-100 text-warning-700': status === 'PENDENTE',
      'bg-success-100 text-success-700': status === 'APROVADO',
      'bg-danger-100 text-danger-700': status === 'REJEITADO',
      'bg-surface-200 text-surface-800': status === 'RASCUNHO',
    };
  }


  novoOrcamento() {
    this.router.navigate(['/client/orcamento/novo']);
  }
  listaOrcamento() {
    this.router.navigate(['/client/orcamento']);
  }
  visualizar(id: any) {

  }
}
