import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { BaseService } from '../../../../services/base.service';
import { CatalogoRecursoItem, RegistrarRecursoResponse } from '../../../../models/permissao';
import { descricaoAcaoPermissao } from '../../../../utils/permission-labels.util';

@Component({
  selector: 'app-catalogo-recursos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule],
  templateUrl: './catalogo-recursos-list.html',
})
export class CatalogoRecursosList implements OnInit {
  private baseService = inject(BaseService);
  private messageService = inject(MessageService);

  lista: CatalogoRecursoItem[] = [];
  loading = false;
  registrandoModulo = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.baseService.findAll('admin/permissoes/catalogo').subscribe({
      next: (res: CatalogoRecursoItem[]) => {
        this.lista = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  acoesLabel(item: CatalogoRecursoItem): string {
    return item.acoesSugeridas.map((a) => descricaoAcaoPermissao(a)).join(', ');
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'COMPLETO':
        return 'success';
      case 'PARCIAL':
        return 'warn';
      default:
        return 'danger';
    }
  }

  podeCadastrar(item: CatalogoRecursoItem): boolean {
    return item.status !== 'COMPLETO';
  }

  registrar(item: CatalogoRecursoItem): void {
    if (!this.podeCadastrar(item)) {
      return;
    }
    this.registrandoModulo = item.modulo;
    this.baseService
      .save('admin/permissoes/registrar-recurso', { recurso: item.modulo, descricao: item.label }, undefined)
      .subscribe({
        next: (res: RegistrarRecursoResponse) => {
          this.registrandoModulo = '';
          const criadas = res?.criadas?.length ?? 0;
          this.messageService.add({
            severity: 'success',
            summary: 'Permissões registradas',
            detail: `${criadas} permissão(ões) criada(s) para ${item.label}.`,
          });
          this.carregar();
        },
        error: () => {
          this.registrandoModulo = '';
        },
      });
  }

  registrarTodosPendentes(): void {
    const pendentes = this.lista.filter((i) => this.podeCadastrar(i));
    if (!pendentes.length) {
      return;
    }
    this.loading = true;
    let index = 0;
    const proximo = () => {
      if (index >= pendentes.length) {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Cadastro em lote concluído',
          detail: `${pendentes.length} recurso(s) processado(s).`,
        });
        this.carregar();
        return;
      }
      const item = pendentes[index++];
      this.baseService
        .save('admin/permissoes/registrar-recurso', { recurso: item.modulo, descricao: item.label }, undefined)
        .subscribe({
          next: () => proximo(),
          error: () => proximo(),
        });
    };
    proximo();
  }

  pendentesCount(): number {
    return this.lista.filter((i) => this.podeCadastrar(i)).length;
  }
}
