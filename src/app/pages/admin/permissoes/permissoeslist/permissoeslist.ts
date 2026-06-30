import { Component, ViewChild, inject } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import {
  ActionConfig,
  ColumnConfig,
  HeaderListGenerico,
} from '../../../../components/header-list-generico/header-list-generico';
import { ModuloPermissaoForm } from '../modulo-permissao-form/modulo-permissao-form';
import { ModuloPermissaoAdmin } from '../../../../models/permissao';
import { BaseService } from '../../../../services/base.service';
import { CatalogoRecursosList } from '../catalogo-recursos-list/catalogo-recursos-list';
import { PermissaoItensList } from '../permissao-itens-list/permissao-itens-list';

@Component({
  selector: 'app-permissoeslist',
  imports: [TabsModule, HeaderListGenerico, ModuloPermissaoForm, CatalogoRecursosList, PermissaoItensList],
  templateUrl: './permissoeslist.html',
})
export class Permissoeslist {
  @ViewChild(HeaderListGenerico) header!: HeaderListGenerico;

  endpoint = 'admin/recursos';
  loading = false;
  isDialog = false;
  moduloEdicao = '';

  private baseService = inject(BaseService);

  columns: ColumnConfig[] = [
    { field: 'modulo', header: 'Código', minWidth: '10rem', filterType: 'text' },
    { field: 'nmModulo', header: 'Recurso', minWidth: '14rem', filterType: 'text' },
    { field: 'totalPermissoes', header: 'Permissões', minWidth: '8rem', filterType: 'numeric' },
    {
      field: 'flAtivo',
      header: 'Ativo',
      minWidth: '8rem',
      filterType: 'boolean',
      formatter: (value) => (value ? 'Sim' : 'Não'),
    },
  ];

  actions: ActionConfig[] = [
    {
      icon: 'pi pi-pencil',
      label: 'Editar',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row: ModuloPermissaoAdmin) => this.onEdit(row),
    },
    {
      icon: 'pi pi-ban',
      label: 'Desativar',
      severity: 'danger',
      rounded: true,
      outlined: true,
      onClick: (row: ModuloPermissaoAdmin) => this.onDesativar(row),
    },
  ];

  onAdd() {
    this.moduloEdicao = '';
    this.isDialog = true;
  }

  onShow = () => {
    this.header?.carregarLazy({ first: 0, rows: 10 });
  };

  onEdit(row: ModuloPermissaoAdmin) {
    this.moduloEdicao = row.modulo;
    this.isDialog = true;
  }

  onDesativar(row: ModuloPermissaoAdmin) {
    if (!row.flAtivo) {
      return;
    }
    this.loading = true;
    this.baseService.deleteById(this.endpoint, row.modulo).subscribe({
      next: () => {
        this.loading = false;
        this.onShow();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
