import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutCardConfig } from '../layout-card-config/layout-card-config';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { BaseService } from '../../../../services/base.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { ConfiguracaoNotificacao } from '../../../../models/configuracao-notificacao';
@Component({
  selector: 'app-config-notificacao',
  imports: [LayoutCardConfig, LayoutCampo, CommonModule, FormsModule,ToggleSwitchModule,DividerModule],
  templateUrl: './config-notificacao.html',
  styleUrl: './config-notificacao.scss',
})
export class ConfigNotificacao {
  public objeto: ConfiguracaoNotificacao = new ConfiguracaoNotificacao();
  loading: boolean = true;
  private endpoint = 'configuracao-notificacao';
  private baseService = inject(BaseService);

  ngAfterViewInit(): void {
    this.onEdit();
  }

  onEdit() {

    // this.baseService.findAll(`${this.endpoint}/`).subscribe({
    //   next: (res: any) => {
    //     this.objeto = res;

    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     this.loading = false;
    //   },
    // });
  }

  onSave() {
    this.loading = true;

      // this.baseService.create(`${this.endpoint}/`, this.objeto).subscribe({
      //   next: () => {
      //     this.loading = false;

      //   },
      //   error: (erro) => {
      //     this.loading = false;
      //   },
      // });
  }


}
