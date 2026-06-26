import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  ActionConfig,
  ColumnConfig,
  HeaderListGenerico,
} from '../../../../components/header-list-generico/header-list-generico';
import { PermissoesEditorDialog } from '../../../../components/permissoes-editor-dialog/permissoes-editor-dialog';
import { PapelListItem } from '../../../../models/permissao';

@Component({
  selector: 'app-papellist',
  imports: [HeaderListGenerico, PermissoesEditorDialog],
  templateUrl: './papellist.html',
})
export class Papellist {
  @ViewChild(HeaderListGenerico) header!: HeaderListGenerico;

  endpoint = 'admin/papeis';
  loading = false;
  isPermissoesDialog = false;
  idPapelEdicao = 0;
  nmPapelEdicao = '';

  columns: ColumnConfig[] = [
    {
      field: 'nmPapel',
      header: 'Papel',
      minWidth: '12rem',
      filterType: 'text',
      formatter: (value) => this.formatarPapel(value),
    },
    {
      field: 'totalPermissoes',
      header: 'Permissões',
      minWidth: '8rem',
      filterType: 'numeric',
    },
  ];

  actions: ActionConfig[] = [
    {
      icon: 'pi pi-key',
      label: 'Permissões',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row: PapelListItem) => this.onEditarPermissoes(row),
    },
  ];

  onShow = () => {
    this.header?.carregarLazy({ first: 0, rows: 10 });
  };

  onEditarPermissoes(row: PapelListItem) {
    this.idPapelEdicao = row.idPapel;
    this.nmPapelEdicao = this.formatarPapel(row.nmPapel);
    this.isPermissoesDialog = true;
  }

  private formatarPapel(papel: string): string {
    if (papel === 'ADMIN') return 'Administrador';
    if (papel === 'USER') return 'Usuário';
    return papel;
  }
}
