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
import { Catalogo } from '../../../../models/catalogo';
import { FormatDataParaListagem } from '../../../../utils/FormatarData';

@Component({
  selector: 'app-orcamentolist',
  imports: [TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    HeaderListGenerico,],
  templateUrl: './orcamentolist.html',
  styleUrl: './orcamentolist.scss',
})
export class Orcamentolist {
  loading: boolean = true;
  public listagem: Catalogo[] = [];
  public baseService = inject(BaseService);
  endpoint = 'orcamento';
  primaryKey = 'idOrcamento';
  router = inject(Router);
  private route = inject(ActivatedRoute);
  isDialog: boolean = false;
  idEdicao!: number;
  constructor(private cd: ChangeDetectorRef) { }

  columns: ColumnConfig[] = [
    {
      field: 'nuOrcamento',
      header: 'Número',
      minWidth: '10rem',
      filterType: 'text',
    },
    {
      field: 'nmCliente',
      header: 'Cliente',
      minWidth: '15rem',
      filterType: 'text',
    },
    {
      field: 'vlPrecoBase',
      header: 'Valor',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value ?? 0),
    },
    {
      field: 'dtEmissao',
      header: 'Emissão',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value: any) => FormatDataParaListagem(value),
    },
    {
      field: 'dtValido',
      header: 'Validade',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value: any) => FormatDataParaListagem(value),
    },
    {
      field: 'tpStatus',
      header: 'Status',
      minWidth: '10rem',
      filterType: 'text',
    },

  ];

  actions: ActionConfig[] = [
    {
      icon: 'pi pi-pencil',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onEdit(row),
    },
    {
      icon: 'pi pi-eye',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onView(row),
      requiresConfirmation: false
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
    this.router.navigate(['/client/orcamento/novo']);
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
      const id = item[this.primaryKey];

      this.router.navigate(['/client/orcamento', id]);
    } else {
      console.error('ID está indefinido');
    }
  } 

  onView(item: any) {
    if (item && item['cdPublico']) {
      const codigo = item['cdPublico'];
      this.router.navigate(['public/orcamento', codigo]);
    } else {
      console.error('ID está indefinido');
    }
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
