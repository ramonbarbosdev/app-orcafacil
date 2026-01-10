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
import { Catalogoform } from "../catalogoform/catalogoform";

@Component({
  selector: 'app-catalogolist',
  imports: [TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    HeaderListGenerico, Catalogoform],
  templateUrl: './catalogolist.html',
  styleUrl: './catalogolist.scss',
})
export class Catalogolist {
  loading: boolean = true;
  public listagem: Catalogo[] = [];
  public baseService = inject(BaseService);
  endpoint = 'catalogo';
  primaryKey = 'idCatalogo';
  router = inject(Router);
  private route = inject(ActivatedRoute);
  isDialog: boolean = false;
  idEdicao!: number;
  constructor(private cd: ChangeDetectorRef) { }

  columns: ColumnConfig[] = [
    {
      field: 'cdCatalogo',
      header: 'Código',
      minWidth: '10rem',
      filterType: 'text',
    },
    {
      field: 'nmCatalogo',
      header: 'Nome',
      minWidth: '15rem',
      filterType: 'text',
    },
    {
      field: 'vlCustoBase',
      header: 'Custo',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value ?? 0),
    },
    {
      field: 'vlPrecoBase',
      header: 'Material',
      minWidth: '10rem',
      filterType: 'text',
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value ?? 0),

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
