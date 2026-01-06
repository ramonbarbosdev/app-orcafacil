import { Component, inject } from '@angular/core';
import { LayoutCardConfig } from "../layout-card-config/layout-card-config";
import { BaseService } from '../../../../services/base.service';
import { ConfirmationService } from 'primeng/api';
import { Metodoajuste } from '../../../../models/metodoajuste';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { LayoutCampo } from "../../../../components/layout-campo/layout-campo";
import { FlagOption } from '../../../../models/flag-option';
import { SelectModule } from 'primeng/select';
import { Campopersonalizado } from '../../../../models/campopersonalizado';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-config-metodo-ajuste',
  imports: [LayoutCardConfig, ButtonModule, FormsModule, CommonModule, TagModule, TableModule, LayoutCampo, SelectModule, InputTextModule, ToggleSwitchModule, InputNumberModule],
  templateUrl: './config-metodo-ajuste.html',
  styleUrl: './config-metodo-ajuste.scss',
})
export class ConfigMetodoAjuste {


  private baseService = inject(BaseService);
  private confirmationService = inject(ConfirmationService);

  endpoint = 'metodoajuste';

  lista: Metodoajuste[] = [];
  objeto: Metodoajuste = new Metodoajuste();
  itemSelecionado?: Metodoajuste;

  listaCampos: FlagOption[] = [];
  listaTiposAjuste: FlagOption[] = [];
  listaTiposOperacao: FlagOption[] = [];
  campoSelecionado?: any;

  ngOnInit() {
    this.obterCampos();
    this.tiposOperacao();
    this.tipoAjuste();
    this.carregarLista();
  }

  carregarLista() {
    this.baseService.findAll(`${this.endpoint}/obter-por-tenant`)
      .subscribe(res => this.lista = res);
  }

  onCampoChange() {
    this.campoSelecionado = this.listaCampos.find(
      c => Number(c.code) == this.objeto.idCampoPersonalizado
    );
    this.objeto.vlCondicao = '';
    console.log(this.campoSelecionado)

  }

  onSave() {
    this.baseService.create(`${this.endpoint}/cadastrar`, this.objeto)
      .subscribe(() => {
        this.objeto = new Metodoajuste();
        this.campoSelecionado = undefined;
        this.carregarLista();
      });
  }

  onEdit(event: any) {
    this.objeto = { ...event.data };
    this.campoSelecionado = event.data.campoPersonalizado;
  }

  confirmarDelete(item: Metodoajuste) {
    this.confirmationService.confirm({
      message: 'Deseja realmente excluir este ajuste?',
      accept: () => this.deletar(item)
    });
  }

  deletar(item: Metodoajuste) {
    this.baseService.deleteById(this.endpoint, item.idMetodoAjuste)
      .subscribe(() => this.carregarLista());
  }


  obterCampos() {
    this.baseService.findAll('campopersonalizado/')
      .subscribe(res => {
        this.listaCampos = res.map((c: any) => ({
          code: c.idCampoPersonalizado,
          name: c.nmCampoPersonalizado,
          tpCampoPersonalizado: c.tpCampoPersonalizado
        }));
      });
  }

  tipoAjuste() {
    this.baseService.findAll(`${this.endpoint}/tipo-ajuste`)
      .subscribe(res => {
        this.listaTiposAjuste = res.map((index: any) => ({
          code: index,
          name: index,
        }));
      });
  }

  tiposOperacao() {
    this.baseService.findAll(`${this.endpoint}/tipo-operacao`)
      .subscribe(res => {
        this.listaTiposOperacao = res.map((index: any) => ({
          code: index,
          name: index,
        }));
      });
  }

}
