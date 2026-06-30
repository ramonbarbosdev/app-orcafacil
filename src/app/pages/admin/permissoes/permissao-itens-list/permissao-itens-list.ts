import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BaseService } from '../../../../services/base.service';
import { PermissaoDetalhe, PermissaoItemRequest } from '../../../../models/permissao';

@Component({
  selector: 'app-permissao-itens-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './permissao-itens-list.html',
})
export class PermissaoItensList implements OnInit {
  private baseService = inject(BaseService);

  lista: PermissaoDetalhe[] = [];
  loading = false;
  dialogVisible = false;
  salvando = false;
  filtro = '';

  form: PermissaoItemRequest = { modulo: '', acao: '', descricao: '' };

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.baseService.findAll('admin/permissoes/itens').subscribe({
      next: (res: PermissaoDetalhe[]) => {
        this.lista = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get listaFiltrada(): PermissaoDetalhe[] {
    const termo = this.filtro.trim().toLowerCase();
    if (!termo) {
      return this.lista;
    }
    return this.lista.filter(
      (p) =>
        p.nmChave.toLowerCase().includes(termo) ||
        p.modulo.toLowerCase().includes(termo) ||
        p.acao.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo)
    );
  }

  abrirNovo(): void {
    this.form = { modulo: '', acao: '', descricao: '' };
    this.dialogVisible = true;
  }

  salvar(): void {
    if (!this.form.modulo?.trim() || !this.form.acao?.trim()) {
      return;
    }
    this.salvando = true;
    this.baseService.save('admin/permissoes/itens', this.form, undefined).subscribe({
      next: () => {
        this.salvando = false;
        this.dialogVisible = false;
        this.carregar();
      },
      error: () => {
        this.salvando = false;
      },
    });
  }
}
