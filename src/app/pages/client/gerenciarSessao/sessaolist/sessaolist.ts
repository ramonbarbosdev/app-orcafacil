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
import { Novasessao } from '../novasessao/novasessao';
import { ExibirQrcode } from "../exibir-qrcode/exibir-qrcode";
@Component({
  selector: 'app-sessaolist',
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    HeaderListGenerico,
    Novasessao,
    ExibirQrcode,
  ],
  templateUrl: './sessaolist.html',
  styleUrl: './sessaolist.scss',
})
export class Sessaolist {
  loading: boolean = true;
  public listagem: any[] = [];
  public baseService = inject(BaseService);
  endpoint = 'whatsappsessao';
  primaryKey = 'id_whatsappsessao';
  router = inject(Router);
  private route = inject(ActivatedRoute);
  isDialog: boolean = false;
  idEdicao!: number;
  isDialogQRCode: boolean = false;
  idEdicaoQRCode!: number;
  constructor(private cd: ChangeDetectorRef) {}

  columns: ColumnConfig[] = [
    {
      field: 'id_whatsappsessao',
      header: 'Código',
      minWidth: '8rem',
    },
    {
      field: 'nm_whatsappsessao',
      header: 'Nome da Sessão',
      minWidth: '20rem',
    },
    {
      field: 'qrcode',
      header: 'QR Code',
      minWidth: '10rem',
    },
    {
      field: 'tp_status',
      header: 'Status',
      minWidth: '20rem',
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
      icon: 'pi pi-play',
      severity: 'info',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onPlay(row),
      requiresConfirmation: false,
    },
    {
      icon: 'pi pi-power-off',
      severity: 'info',
      rounded: true,
      outlined: true,
      onClick: (row) => this.onPause(row),
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

  ngOnInit(): void {
    this.onShow();
  }

  onShow = () => {
    this.loading = true;

    this.baseService.findAll(`${this.endpoint}/`).subscribe({
      next: (res) => {
        const novaListagem: any[] = [];
        Object.values(res as any).forEach((index: any) => {
          let item = {};
          item = index;
          novaListagem.push(item);
        });
        this.listagem = novaListagem;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  };

  onEdit(item: any) {
    // if (item && item[this.primaryKey]) {
    //   this.idEdicao = item[this.primaryKey];
    //   this.isDialog = true;
    // } else {
    //   console.error('ID está indefinido');
    // }
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
  onPause(item: any) {
    this.loading = true;
    this.baseService.deleteById(`${this.endpoint}/encerrar`, item[this.primaryKey]).subscribe({
      next: (res) => {
        this.loading = false;
        this.onShow();
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }
  onPlay(item: any) {
    if (item && item[this.primaryKey]) {
      this.idEdicaoQRCode = item[this.primaryKey];
      this.isDialogQRCode = true;
    } else {
      console.error('ID está indefinido');
    }
  }
}
