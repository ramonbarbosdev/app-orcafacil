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
import { OrganizacaoVinculoForm } from '../../../admin/organizacao-vinculo-form/organizacao-vinculo-form';
import { MessageService } from 'primeng/api';

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
    OrganizacaoVinculoForm,
  ],
  templateUrl: './empresalist.html',
  styleUrl: './empresalist.scss',
})
export class Empresalist {
  loading = false;
  baseService = inject(BaseService);
  messageService = inject(MessageService);
  endpoint = 'admin/organizacoes';
  router = inject(Router);

  isDialog = false;
  isVinculoDialog = false;
  idEdicao = 0;
  idOrganizacaoVinculo = 0;
  nmOrganizacaoVinculo = '';

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
      icon: 'pi pi-user-plus',
      label: 'Usuário',
      rounded: true,
      outlined: true,
      requiresConfirmation: false,
      onClick: (row) => this.onVincularUsuario(row),
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

  onVincularUsuario(item: Record<string, unknown>) {
    const id = this.getOrganizacaoId(item);
    if (!id) {
      console.error('ID da organização indefinido');
      return;
    }
    this.idOrganizacaoVinculo = id;
    this.nmOrganizacaoVinculo = String(item['nmOrganizacao'] ?? item['nmEmpresa'] ?? '');
    this.isVinculoDialog = true;
  }

  onVinculoSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Usuário vinculado',
      detail: 'O usuário foi cadastrado e vinculado à organização.',
    });
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
