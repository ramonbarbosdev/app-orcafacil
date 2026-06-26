import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseService } from '../../../../services/base.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionConfig,
  ColumnConfig,
  HeaderListGenerico,
} from '../../../../components/header-list-generico/header-list-generico';
import { Planoassinatura } from '../../../../models/planoassinatura';
import { Planoassinaturaform } from "../planoassinaturaform/planoassinaturaform";
import { PermissoesEditorDialog } from '../../../../components/permissoes-editor-dialog/permissoes-editor-dialog';


@Component({
  selector: 'app-planoassinaturalist',
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    HeaderListGenerico,
    Planoassinaturaform,
    PermissoesEditorDialog,
  ],
  templateUrl: './planoassinaturalist.html',
  styleUrl: './planoassinaturalist.scss',
})
export class Planoassinaturalist {
  loading: boolean = true;
  public baseService = inject(BaseService);
  endpoint = 'admin/planos-assinatura';
  primaryKey = 'idPlanoAssinatura';
  router = inject(Router);
  private route = inject(ActivatedRoute);
  isDialog: boolean = false;
  isPermissoesDialog = false;
  idEdicao!: number;
  idPlanoPermissoes = 0;
  nmPlanoPermissoes = '';
  constructor(private cd: ChangeDetectorRef) { }

  columns: ColumnConfig[] = [
    {
      field: 'nmPlanoAssinatura',
      header: 'Nome',
      minWidth: '15rem',
      filterType: 'text',
    },
    {
      field: 'vlMensal',
      header: 'Valor',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value),
    },
    {
      field: 'nuLimitemensagens',
      header: 'Limite',
      minWidth: '10rem',
      filterType: 'text',
    },
  ];

  actions: ActionConfig[] = [
    {
      icon: 'pi pi-key',
      label: 'Recursos',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row) => this.onEditarPermissoes(row),
    },
    {
      icon: 'pi pi-pencil',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onEdit(row),
    },
    {
      icon: 'pi pi-trash',
      severity: 'danger',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onDelete(row),
    },
  ];

  onAdd() {
    this.idEdicao = 0;
    this.isDialog = true;
  }

  @ViewChild(HeaderListGenerico) header!: HeaderListGenerico;

  ngAfterViewInit(): void {
    this.onShow();
  }

  onShow = () => {
    if (this.header) {
      this.header.carregarLazy({ first: 0, rows: 10 });
    }
  };

  onEdit(item: any) {
    if (item && item[this.primaryKey]) {
      this.idEdicao = item[this.primaryKey];
      this.isDialog = true;
    } else {
      console.error('ID está indefinido');
    }
  }

  onEditarPermissoes(item: Planoassinatura) {
    this.idPlanoPermissoes = item.idPlanoAssinatura;
    this.nmPlanoPermissoes = item.nmPlanoAssinatura;
    this.isPermissoesDialog = true;
  }

  onDelete(item: any) {
    this.loading = true;
    this.baseService.deleteById(`${this.endpoint}`, item[this.primaryKey]).subscribe({
      next: (res) => {
        this.loading = false;
        this.onShow();
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }
}
