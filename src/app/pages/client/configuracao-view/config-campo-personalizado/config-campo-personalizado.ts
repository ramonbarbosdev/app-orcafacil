import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from "../layout-card-config/layout-card-config";
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseService } from '../../../../services/base.service';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';


@Component({
  selector: 'app-config-campo-personalizado',
  imports: [LayoutCardConfig, TableModule, TagModule, LayoutCampo, CommonModule, FormsModule, SelectModule, ButtonModule, InputTextModule],
  templateUrl: './config-campo-personalizado.html',
  styleUrl: './config-campo-personalizado.scss',
})
export class ConfigCampoPersonalizado {

  private baseService = inject(BaseService);
  loading: boolean = true;
  private endpoint = 'campopersonalizado';
  private confirmationService = inject(ConfirmationService);

  listaCampos: Campopersonalizado[] = [];
  campoSelecionado?: Campopersonalizado;

  objeto: Campopersonalizado = new Campopersonalizado();


  tiposCampo = [
    { label: 'Texto', value: 'TEXT' },
    { label: 'Número', value: 'NUMBER' },
    { label: 'Booleano', value: 'BOOLEAN' }
  ];

  ngOnInit() {
    this.carregarLista();
  }


  carregarLista() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {

        if (res) {

          this.listaCampos = res;
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  confirmarDelete(campo: Campopersonalizado) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir o campo "${campo.nmCampoPersonalizado}"?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deletar(campo);
      }
    });
  }

  deletar(campo: Campopersonalizado) {
    this.baseService.deleteById(`${this.endpoint}`, campo.idCampoPersonalizado)
      .subscribe({
        next: () => {

          this.carregarLista();
          this.novo();
        },
        error: err => {

        }
      });
  }

  onEdit() {

    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`).subscribe({
      next: (res: any) => {

        if (res) {

          this.objeto = res;
          this.listaCampos = res;

        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  onSelectCampo(event: any) {
    this.objeto = { ...event.data };
  }

  novo() {
    this.objeto = new Campopersonalizado();
  }

  onSave() {
    this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto).subscribe(() => {
      this.novo();
      this.carregarLista();
    });
  }
}
