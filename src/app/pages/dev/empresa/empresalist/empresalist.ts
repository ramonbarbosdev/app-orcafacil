import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseService } from '../../../../services/base.service';
import { Router } from '@angular/router';
import {
  ActionConfig,
  ColumnConfig,
  HeaderListGenerico,
} from '../../../../components/header-list-generico/header-list-generico';
import { Empresaform } from '../empresaform/empresaform';
import { FormatCpfCnpj } from '../../../../format/FormatarCpfCnpj';
import { OrganizacaoUsuariosDialog } from '../../../admin/organizacao-usuarios-dialog/organizacao-usuarios-dialog';
import { OrganizacaoPlanoDialog } from '../../../../components/organizacao-plano-dialog/organizacao-plano-dialog';

@Component({
  selector: 'app-empresalist',
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    HeaderListGenerico,
    Empresaform,
    OrganizacaoUsuariosDialog,
    OrganizacaoPlanoDialog,
  ],
  templateUrl: './empresalist.html',
  styleUrl: './empresalist.scss',
})
export class Empresalist {
  loading = false;
  baseService = inject(BaseService);
  endpoint = 'admin/organizacoes';
  router = inject(Router);

  isDialog = false;
  isUsuariosDialog = false;
  isPlanoDialog = false;
  idEdicao = 0;
  idOrganizacaoUsuarios = 0;
  idOrganizacaoPlano = 0;
  nmOrganizacaoUsuarios = '';
  nmOrganizacaoPlano = '';

  columns: ColumnConfig[] = [
    {
      field: 'dsDocumento',
      header: 'CPF / CNPJ',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value, row) => FormatCpfCnpj(value ?? row?.cdEmpresa ?? ''),
    },
    {
      field: 'nmOrganizacao',
      header: 'Organização',
      minWidth: '15rem',
      filterType: 'text',
      formatter: (value, row) => value ?? row?.nmEmpresa ?? '',
    },
  ];

  actions: ActionConfig[] = [
    {
      icon: 'pi pi-credit-card',
      label: 'Plano',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row) => this.onGerenciarPlano(row),
    },
    {
      icon: 'pi pi-users',
      label: 'Usuários',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row) => this.onGerenciarUsuarios(row),
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

  @ViewChild(HeaderListGenerico) header!: HeaderListGenerico;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.onShow();
  }

  onShow = () => {
    this.header?.carregarLazy({ first: 0, rows: 10 });
  };

  onAdd() {
    this.idEdicao = 0;
    this.isDialog = true;
  }

  onEdit(item: Record<string, unknown>) {
    const id = this.getOrganizacaoId(item);
    if (!id) {
      console.error('ID da organização indefinido');
      return;
    }
    this.idEdicao = id;
    this.isDialog = true;
  }

  onGerenciarPlano(item: Record<string, unknown>) {
    const id = this.getOrganizacaoId(item);
    if (!id) return;
    this.idOrganizacaoPlano = id;
    this.nmOrganizacaoPlano = String(item['nmOrganizacao'] ?? item['nmEmpresa'] ?? '');
    this.isPlanoDialog = true;
  }

  onGerenciarUsuarios(item: Record<string, unknown>) {
    const id = this.getOrganizacaoId(item);
    if (!id) {
      console.error('ID da organização indefinido');
      return;
    }
    this.idOrganizacaoUsuarios = id;
    this.nmOrganizacaoUsuarios = String(item['nmOrganizacao'] ?? item['nmEmpresa'] ?? '');
    this.isUsuariosDialog = true;
  }

  onDelete(item: Record<string, unknown>) {
    const id = this.getOrganizacaoId(item);
    if (!id) return;

    this.loading = true;
    this.baseService.deleteById(this.endpoint, id).subscribe({
      next: () => {
        this.loading = false;
        this.onShow();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private getOrganizacaoId(item: Record<string, unknown>): number {
    return Number(item['idOrganizacao'] ?? item['idEmpresa'] ?? 0);
  }
}
