import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { ActionConfig, ColumnConfig, HeaderListGenerico } from '../../../../components/header-list-generico/header-list-generico';
import { ActivatedRoute, Router } from '@angular/router';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { BaseService } from '../../../../services/base.service';
import { Materialform } from "../materialform/materialform";
import { TipoCampo, TipoCampoLabel } from '../../../../enum/TipoCampo';
import { TipoValor, TipoValorLabel } from '../../../../enum/TipoValor';

@Component({
  selector: 'app-materiallist',
  imports: [HeaderListGenerico, Materialform],
  templateUrl: './materiallist.html',
  styleUrl: './materiallist.scss',
})
export class Materiallist {
loading: boolean = true;
  public listagem: Campopersonalizado[] = [];
  public baseService = inject(BaseService);
  endpoint = 'campopersonalizado';
  primaryKey = 'idCampoPersonalizado';
  router = inject(Router);
  private route = inject(ActivatedRoute);
  isDialog: boolean = false;
  idEdicao!: number;
  constructor(private cd: ChangeDetectorRef) { }

  columns: ColumnConfig[] = [
    {
      field: 'cdCampoPersonalizado',
      header: 'Código',
      minWidth: '10rem',
      filterType: 'text',
    },
    {
      field: 'nmCampoPersonalizado',
      header: 'Nome',
      minWidth: '15rem',
      filterType: 'text',
    },
    {
      field: 'tpCampoPersonalizado',
      header: 'Tipo de Material',
      minWidth: '15rem',
      filterType: 'text',
      formatter: (value) => TipoCampoLabel[value as TipoCampo] ?? value,
    },
    {
      field: 'tpCampoValor',
      header: 'Tipo do Valor',
      minWidth: '15rem',
      filterType: 'text',
      formatter: (value) => TipoValorLabel[value as TipoValor] ?? value,
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
